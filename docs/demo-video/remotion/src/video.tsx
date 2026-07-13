import type {ReactNode} from "react";
import {
  AbsoluteFill,
  Easing,
  Img,
  Sequence,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

const colors = {
  accent: "#2f8f62",
  ink: "#18201d",
  line: "#dce6e0",
  muted: "#64716b",
  primary: "#3f7159",
  soft: "#f2f7f4",
  surface: "#ffffff",
};

const font = '"Hanken Grotesk", Inter, ui-sans-serif, system-ui, sans-serif';

type SceneProps = {
  children: ReactNode;
  duration: number;
  eyebrow: string;
  headline: string;
  subline?: string;
};

const Scene = ({children, duration, eyebrow, headline, subline}: SceneProps) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const entry = spring({frame, fps, config: {damping: 18, stiffness: 95}});
  const opacity = interpolate(frame, [0, 10, duration - 1], [0.72, 1, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{background: "#f8fbf9", color: colors.ink, fontFamily: font, opacity}}>
      <div style={{display: "flex", flexDirection: "column", height: "100%", padding: "54px 72px 54px"}}>
        <div style={{alignItems: "end", display: "flex", justifyContent: "space-between", marginBottom: 26}}>
          <div style={{maxWidth: 1320, transform: `translateY(${(1 - entry) * 24}px)`}}>
            <div style={{color: colors.primary, fontSize: 19, fontWeight: 800, letterSpacing: 2.4, marginBottom: 9, textTransform: "uppercase"}}>{eyebrow}</div>
            <div style={{fontSize: 52, fontWeight: 720, letterSpacing: -2.4, lineHeight: 1.02}}>{headline}</div>
            {subline ? <div style={{color: colors.muted, fontSize: 23, lineHeight: 1.35, marginTop: 11}}>{subline}</div> : null}
          </div>
          <div style={{color: colors.primary, fontSize: 28, fontWeight: 850, letterSpacing: -1}}>EGOG</div>
        </div>
        <div style={{flex: 1, minHeight: 0}}>{children}</div>
      </div>
    </AbsoluteFill>
  );
};

type ProductFrameProps = {
  image: string;
  objectPosition?: string;
  scaleFrom?: number;
  scaleTo?: number;
};

const ProductFrame = ({image, objectPosition = "center top", scaleFrom = 1, scaleTo = 1.045}: ProductFrameProps) => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  const scale = interpolate(frame, [0, durationInFrames], [scaleFrom, scaleTo], {
    easing: Easing.inOut(Easing.quad),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div style={{background: colors.surface, border: `1px solid ${colors.line}`, borderRadius: 24, boxShadow: "0 28px 76px rgba(24,50,39,.14)", height: "100%", overflow: "hidden", position: "relative"}}>
      <Img
        src={staticFile(`captures/${image}.png`)}
        style={{height: "100%", objectFit: "cover", objectPosition, transform: `scale(${scale})`, transformOrigin: objectPosition, width: "100%"}}
      />
    </div>
  );
};

const Callout = ({children, side = "right"}: {children: ReactNode; side?: "left" | "right"}) => (
  <div
    style={{
      background: colors.ink,
      border: "1px solid rgba(255,255,255,.18)",
      borderRadius: 14,
      bottom: 30,
      boxShadow: "0 18px 44px rgba(0,0,0,.18)",
      color: "white",
      fontSize: 18,
      fontWeight: 680,
      lineHeight: 1.35,
      padding: "14px 19px",
      position: "absolute",
      ...(side === "right" ? {right: 30} : {left: 30}),
    }}
  >
    {children}
  </div>
);

const Opening = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const reveal = spring({frame, fps, config: {damping: 16, stiffness: 82}});
  return (
    <AbsoluteFill style={{alignItems: "center", background: colors.ink, color: "white", display: "flex", fontFamily: font, justifyContent: "center"}}>
      <div style={{opacity: reveal, textAlign: "center", transform: `scale(${0.88 + reveal * 0.12})`}}>
        <div style={{color: "#65d29c", fontSize: 28, fontWeight: 850, letterSpacing: 6}}>EGOG</div>
        <h1 style={{fontSize: 82, letterSpacing: -4, lineHeight: 1.02, margin: "26px 0 18px"}}>From climate data to on-chain proof</h1>
        <p style={{color: "#b7c8c0", fontSize: 28, margin: 0}}>Versioned dMRV Snapshots connected to signed participation.</p>
      </div>
    </AbsoluteFill>
  );
};

const WalletScene = ({duration}: {duration: number}) => (
  <Scene duration={duration} eyebrow="Google sign-in" headline="Embedded wallet ready" subline="No extension, seed phrase, Faucet, or manual network setup is required.">
    <div style={{height: "100%", position: "relative"}}>
      <ProductFrame image="consent" objectPosition="center 31%" scaleFrom={1.02} scaleTo={1.08} />
      <Callout>Authenticated wallet · 0x1AB0…4721</Callout>
    </div>
  </Scene>
);

const ConfirmationScene = ({duration}: {duration: number}) => {
  const frame = useCurrentFrame();
  const switchAt = 105;
  const confirmingOpacity = interpolate(frame, [switchAt - 12, switchAt + 10], [1, 0], {extrapolateLeft: "clamp", extrapolateRight: "clamp"});
  const completionOpacity = interpolate(frame, [switchAt - 6, switchAt + 18], [0, 1], {extrapolateLeft: "clamp", extrapolateRight: "clamp"});

  return (
    <Scene duration={duration} eyebrow="GIWA Sepolia" headline="Participation recorded. Badge issued." subline="EGOG sponsors the transaction gas and waits for a successful receipt.">
      <div style={{height: "100%", position: "relative"}}>
        <div style={{inset: 0, opacity: confirmingOpacity, position: "absolute"}}><ProductFrame image="confirming" /></div>
        <div style={{inset: 0, opacity: completionOpacity, position: "absolute"}}><ProductFrame image="completion" /></div>
        {frame >= switchAt ? <Callout side="left">Member #7 · Token ID 7 · Snapshot v3</Callout> : null}
      </div>
    </Scene>
  );
};

const ProofScene = ({duration}: {duration: number}) => {
  const frame = useCurrentFrame();
  const switchAt = 270;
  const explorerOpacity = interpolate(frame, [switchAt - 15, switchAt + 10], [1, 0], {extrapolateLeft: "clamp", extrapolateRight: "clamp"});
  const snapshotOpacity = interpolate(frame, [switchAt - 8, switchAt + 16], [0, 1], {extrapolateLeft: "clamp", extrapolateRight: "clamp"});

  return (
    <Scene duration={duration} eyebrow="Public proof" headline="Independently verifiable on GIWA" subline="The same transaction and public Snapshot URI remain open for inspection.">
      <div style={{height: "100%", position: "relative"}}>
        <div style={{inset: 0, opacity: explorerOpacity, position: "absolute"}}>
          <ProductFrame image="giwa-transaction" objectPosition="center 18%" scaleFrom={1.03} scaleTo={1.08} />
          <Callout>Success · Block 30588788 · Token ID 7</Callout>
        </div>
        <div style={{inset: 0, opacity: snapshotOpacity, position: "absolute"}}>
          <ProductFrame image="snapshot-json" objectPosition="left top" scaleFrom={1.65} scaleTo={1.8} />
          <Callout side="left">Public IPFS Snapshot v3 · bafkreida…mmygba</Callout>
        </div>
      </div>
    </Scene>
  );
};

const Flow = () => {
  const frame = useCurrentFrame();
  const steps = ["dMRV Data", "Versioned Snapshot", "User Signature", "GIWA Record + Badge"];
  return (
    <AbsoluteFill style={{alignItems: "center", background: colors.ink, color: "white", display: "flex", flexDirection: "column", fontFamily: font, justifyContent: "center"}}>
      <div style={{color: "#65d29c", fontSize: 22, fontWeight: 850, letterSpacing: 4}}>THE EGOG FLOW</div>
      <h2 style={{fontSize: 54, letterSpacing: -2.4, margin: "22px 0 48px"}}>Data reviewed. Intent signed. Proof recorded.</h2>
      <div style={{alignItems: "center", display: "flex", gap: 14}}>
        {steps.map((step, index) => {
          const opacity = interpolate(frame, [index * 18, index * 18 + 14], [0, 1], {extrapolateLeft: "clamp", extrapolateRight: "clamp"});
          return (
            <div key={step} style={{alignItems: "center", display: "flex", gap: 14, opacity}}>
              <div style={{background: index === steps.length - 1 ? colors.primary : "#25312d", border: `1px solid ${index === steps.length - 1 ? "#65d29c" : "#52625b"}`, borderRadius: 18, fontSize: 21, fontWeight: 680, padding: "22px 25px"}}>{step}</div>
              {index < steps.length - 1 ? <span style={{color: "#65d29c", fontSize: 31}}>→</span> : null}
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

const Closing = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const reveal = spring({frame, fps, config: {damping: 17, stiffness: 80}});
  return (
    <AbsoluteFill style={{alignItems: "center", background: colors.ink, color: "white", display: "flex", fontFamily: font, justifyContent: "center"}}>
      <div style={{opacity: reveal, textAlign: "center", transform: `translateY(${(1 - reveal) * 18}px)`}}>
        <div style={{color: "#65d29c", fontSize: 38, fontWeight: 850, letterSpacing: 7}}>EGOG</div>
        <div style={{fontSize: 42, fontWeight: 680, letterSpacing: -1.5, marginTop: 24}}>Transparent climate participation, anchored on GIWA.</div>
      </div>
    </AbsoluteFill>
  );
};

export const EGOGDemo = () => (
  <AbsoluteFill style={{background: "#f8fbf9"}}>
    <Sequence durationInFrames={180}><Opening /></Sequence>
    <Sequence from={180} durationInFrames={300}>
      <Scene duration={300} eyebrow="Project discovery" headline="Explore before participating" subline="Three projects, with Vietnam Brick open for participation.">
        <ProductFrame image="project-discovery" />
      </Scene>
    </Sequence>
    <Sequence from={480} durationInFrames={480}>
      <Scene duration={480} eyebrow="Demonstration data" headline="Review the versioned dMRV Snapshot" subline="Monitored reduction, forecast range, lifecycle stage, and v1–v3 history stay clearly labeled as demonstration data.">
        <ProductFrame image="project-detail" objectPosition="center 12%" scaleFrom={1.01} scaleTo={1.08} />
      </Scene>
    </Sequence>
    <Sequence from={960} durationInFrames={330}><WalletScene duration={330} /></Sequence>
    <Sequence from={1290} durationInFrames={330}>
      <Scene duration={330} eyebrow="Explicit consent" headline="Review the exact Snapshot, then sign" subline="On-chain consent is required. Email updates remain an independent optional choice.">
        <ProductFrame image="consent" objectPosition="center 58%" scaleFrom={1.04} scaleTo={1.1} />
      </Scene>
    </Sequence>
    <Sequence from={1620} durationInFrames={330}>
      <Scene duration={330} eyebrow="EIP-712" headline="Sign the participation message" subline="The typed message binds the wallet, project, Snapshot v3, member number, nonce, and deadline.">
        <ProductFrame image="signature" objectPosition="center" />
      </Scene>
    </Sequence>
    <Sequence from={1950} durationInFrames={390}><ConfirmationScene duration={390} /></Sequence>
    <Sequence from={2340} durationInFrames={420}><ProofScene duration={420} /></Sequence>
    <Sequence from={2760} durationInFrames={330}>
      <Scene duration={330} eyebrow="My participation" headline="The Snapshot you signed stays attached" subline="Badge #7, Token ID 7, the joined Snapshot, and the latest project state remain linked in one view.">
        <ProductFrame image="my-page" objectPosition="center 18%" scaleFrom={1.01} scaleTo={1.06} />
      </Scene>
    </Sequence>
    <Sequence from={3090} durationInFrames={210}><Flow /></Sequence>
    <Sequence from={3300} durationInFrames={150}><Closing /></Sequence>
  </AbsoluteFill>
);
