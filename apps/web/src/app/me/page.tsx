import { AppHeader } from "../../components/app-header";
import { SiteFooter } from "../../components/site-footer";
import { MyPage } from "../../features/account/my-page";

export default function AccountPage() {
  return <><AppHeader /><main className="account-page"><MyPage /></main><SiteFooter /></>;
}
