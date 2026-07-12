import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { anyValue } from "@nomicfoundation/hardhat-viem-assertions/predicates";
import { buildParticipationTypedData } from "@egog/shared";
import { network } from "hardhat";
import { getAddress, keccak256, stringToBytes, type Address, type Hex } from "viem";

describe("ParticipationBadge", async function () {
  const { viem, networkHelpers } = await network.create("hardhatMainnet");

  const vietnamProject = keccak256(stringToBytes("vietnam-brick"));
  const solarProject = keccak256(stringToBytes("solar-mobility"));
  const snapshotHash = keccak256(stringToBytes("snapshot-v3"));
  const snapshotURI = "ipfs://snapshot-v3";
  const tokenURI = "ipfs://badge-1";

  it("runs contract tests with the GIWA Sepolia chain id", async () => {
    const publicClient = await viem.getPublicClient();
    assert.equal(await publicClient.getChainId(), 91_342);
  });

  async function deployFixture() {
    const [admin, relayer, participant, otherParticipant, outsider] =
      await viem.getWalletClients();
    const badge = await viem.deployContract("ParticipationBadge", [
      admin.account.address,
      relayer.account.address,
    ]);

    await badge.write.setProjectActive([vietnamProject, true], {
      account: admin.account,
    });

    return {
      admin,
      relayer,
      participant,
      otherParticipant,
      outsider,
      badge,
    };
  }

  async function createSignedJoin({
    badgeAddress,
    participant,
    projectId = vietnamProject,
    memberNumber = 1n,
    nonce = 1n,
    deadline,
    signedSnapshotHash = snapshotHash,
    signedSnapshotVersion = 3n,
    signedSnapshotURI = snapshotURI,
    signedTokenURI = tokenURI,
  }: {
    badgeAddress: Address;
    participant: Awaited<ReturnType<typeof viem.getWalletClients>>[number];
    projectId?: Hex;
    memberNumber?: bigint;
    nonce?: bigint;
    deadline?: bigint;
    signedSnapshotHash?: Hex;
    signedSnapshotVersion?: bigint;
    signedSnapshotURI?: string;
    signedTokenURI?: string;
  }) {
    const expiresAt =
      deadline ?? BigInt((await networkHelpers.time.latest()) + 600);
    const message = {
      participant: participant.account.address,
      projectId,
      snapshotHash: signedSnapshotHash,
      snapshotVersion: signedSnapshotVersion,
      snapshotURI: signedSnapshotURI,
      memberNumber,
      tokenURI: signedTokenURI,
      nonce,
      deadline: expiresAt,
    } as const;
    const signature = await participant.signTypedData(
      buildParticipationTypedData(badgeAddress, message),
    );

    return { message, signature };
  }

  async function join(
    fixture: Awaited<ReturnType<typeof deployFixture>>,
    signed: Awaited<ReturnType<typeof createSignedJoin>>,
    overrides: Partial<typeof signed.message> = {},
  ) {
    const message = { ...signed.message, ...overrides };

    return fixture.badge.write.joinBySig(
      [
        message.participant,
        message.projectId,
        message.snapshotHash,
        message.snapshotVersion,
        message.snapshotURI,
        message.memberNumber,
        message.tokenURI,
        message.nonce,
        message.deadline,
        signed.signature,
      ],
      { account: fixture.relayer.account },
    );
  }

  it("mints a locked badge and records every participation field", async () => {
    const fixture = await networkHelpers.loadFixture(deployFixture);
    const signed = await createSignedJoin({
      badgeAddress: fixture.badge.address,
      participant: fixture.participant,
    });

    await viem.assertions.emitWithArgs(
      join(fixture, signed),
      fixture.badge,
      "ParticipationRecorded",
      [
        fixture.participant.account.address,
        vietnamProject,
        1n,
        1n,
        snapshotHash,
        3n,
        snapshotURI,
        tokenURI,
        anyValue,
      ],
    );

    assert.equal(
      getAddress(await fixture.badge.read.ownerOf([1n])),
      getAddress(fixture.participant.account.address),
    );
    assert.equal(await fixture.badge.read.locked([1n]), true);
    assert.equal(await fixture.badge.read.tokenURI([1n]), tokenURI);
    assert.equal(await fixture.badge.read.projectMemberCount([vietnamProject]), 1n);
    assert.equal(
      await fixture.badge.read.hasParticipated([
        vietnamProject,
        fixture.participant.account.address,
      ]),
      true,
    );
  });

  it("rejects a replayed nonce", async () => {
    const fixture = await networkHelpers.loadFixture(deployFixture);
    const signed = await createSignedJoin({
      badgeAddress: fixture.badge.address,
      participant: fixture.participant,
    });
    await join(fixture, signed);

    await viem.assertions.revertWithCustomError(
      join(fixture, signed),
      fixture.badge,
      "NonceAlreadyUsed",
    );
  });

  it("rejects an expired signature", async () => {
    const fixture = await networkHelpers.loadFixture(deployFixture);
    const signed = await createSignedJoin({
      badgeAddress: fixture.badge.address,
      participant: fixture.participant,
      deadline: BigInt((await networkHelpers.time.latest()) - 1),
    });

    await viem.assertions.revertWithCustomError(
      join(fixture, signed),
      fixture.badge,
      "SignatureExpired",
    );
  });

  it("rejects a signature from a wallet other than participant", async () => {
    const fixture = await networkHelpers.loadFixture(deployFixture);
    const signedByOutsider = await createSignedJoin({
      badgeAddress: fixture.badge.address,
      participant: fixture.outsider,
    });

    await viem.assertions.revertWithCustomError(
      join(fixture, signedByOutsider, {
        participant: fixture.participant.account.address,
      }),
      fixture.badge,
      "InvalidSigner",
    );
  });

  it("rejects tampering with signed snapshot and metadata fields", async () => {
    const fixture = await networkHelpers.loadFixture(deployFixture);
    const signed = await createSignedJoin({
      badgeAddress: fixture.badge.address,
      participant: fixture.participant,
    });
    const tamperedValues: Array<Partial<typeof signed.message>> = [
      { snapshotHash: keccak256(stringToBytes("tampered")) },
      { snapshotVersion: 4n },
      { snapshotURI: "ipfs://tampered-snapshot" },
      { memberNumber: 2n },
      { tokenURI: "ipfs://tampered-badge" },
    ];

    for (const tampered of tamperedValues) {
      await viem.assertions.revertWithCustomError(
        join(fixture, signed, tampered),
        fixture.badge,
        "InvalidSigner",
      );
    }
  });

  it("allows only the registered relayer to submit", async () => {
    const fixture = await networkHelpers.loadFixture(deployFixture);
    const signed = await createSignedJoin({
      badgeAddress: fixture.badge.address,
      participant: fixture.participant,
    });
    const m = signed.message;

    await viem.assertions.revertWithCustomError(
      fixture.badge.write.joinBySig(
        [
          m.participant,
          m.projectId,
          m.snapshotHash,
          m.snapshotVersion,
          m.snapshotURI,
          m.memberNumber,
          m.tokenURI,
          m.nonce,
          m.deadline,
          signed.signature,
        ],
        { account: fixture.outsider.account },
      ),
      fixture.badge,
      "AccessControlUnauthorizedAccount",
    );
  });

  it("allows only admin configuration and blocks joins while paused", async () => {
    const fixture = await networkHelpers.loadFixture(deployFixture);

    await viem.assertions.revertWithCustomError(
      fixture.badge.write.setProjectActive([solarProject, true], {
        account: fixture.outsider.account,
      }),
      fixture.badge,
      "AccessControlUnauthorizedAccount",
    );

    await fixture.badge.write.pause({ account: fixture.admin.account });
    const signed = await createSignedJoin({
      badgeAddress: fixture.badge.address,
      participant: fixture.participant,
    });
    await viem.assertions.revertWithCustomError(
      join(fixture, signed),
      fixture.badge,
      "EnforcedPause",
    );
  });

  it("rejects duplicate participation with a fresh nonce", async () => {
    const fixture = await networkHelpers.loadFixture(deployFixture);
    const first = await createSignedJoin({
      badgeAddress: fixture.badge.address,
      participant: fixture.participant,
    });
    await join(fixture, first);
    const duplicate = await createSignedJoin({
      badgeAddress: fixture.badge.address,
      participant: fixture.participant,
      nonce: 2n,
      memberNumber: 2n,
      signedTokenURI: "ipfs://badge-2",
    });

    await viem.assertions.revertWithCustomError(
      join(fixture, duplicate),
      fixture.badge,
      "AlreadyParticipated",
    );
  });

  it("enforces project-specific sequential member numbers", async () => {
    const fixture = await networkHelpers.loadFixture(deployFixture);
    const skipped = await createSignedJoin({
      badgeAddress: fixture.badge.address,
      participant: fixture.participant,
      memberNumber: 2n,
    });
    await viem.assertions.revertWithCustomErrorWithArgs(
      join(fixture, skipped),
      fixture.badge,
      "UnexpectedMemberNumber",
      [1n, 2n],
    );

    const first = await createSignedJoin({
      badgeAddress: fixture.badge.address,
      participant: fixture.participant,
    });
    await join(fixture, first);
    const second = await createSignedJoin({
      badgeAddress: fixture.badge.address,
      participant: fixture.otherParticipant,
      memberNumber: 2n,
    });
    await join(fixture, second);

    assert.equal(await fixture.badge.read.projectMemberCount([vietnamProject]), 2n);
  });

  it("blocks all ERC-721 transfer and approval paths and exposes ERC-5192", async () => {
    const fixture = await networkHelpers.loadFixture(deployFixture);
    const signed = await createSignedJoin({
      badgeAddress: fixture.badge.address,
      participant: fixture.participant,
    });
    await join(fixture, signed);

    await viem.assertions.revertWithCustomError(
      fixture.badge.write.transferFrom(
        [fixture.participant.account.address, fixture.outsider.account.address, 1n],
        { account: fixture.participant.account },
      ),
      fixture.badge,
      "Soulbound",
    );
    await viem.assertions.revertWithCustomError(
      fixture.badge.write.safeTransferFrom(
        [fixture.participant.account.address, fixture.outsider.account.address, 1n],
        { account: fixture.participant.account },
      ),
      fixture.badge,
      "Soulbound",
    );
    await viem.assertions.revertWithCustomError(
      fixture.badge.write.safeTransferFrom(
        [
          fixture.participant.account.address,
          fixture.outsider.account.address,
          1n,
          "0x",
        ],
        { account: fixture.participant.account },
      ),
      fixture.badge,
      "Soulbound",
    );
    await viem.assertions.revertWithCustomError(
      fixture.badge.write.approve([fixture.outsider.account.address, 1n], {
        account: fixture.participant.account,
      }),
      fixture.badge,
      "Soulbound",
    );
    await viem.assertions.revertWithCustomError(
      fixture.badge.write.setApprovalForAll([fixture.outsider.account.address, true], {
        account: fixture.participant.account,
      }),
      fixture.badge,
      "Soulbound",
    );

    assert.equal(await fixture.badge.read.supportsInterface(["0xb45a3c0e"]), true);
    assert.equal(
      fixture.badge.abi.some(
        (item) => item.type === "function" && item.name === "burn",
      ),
      false,
    );
  });
});
