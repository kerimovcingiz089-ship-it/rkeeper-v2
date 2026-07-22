import { AppProvider, useApp } from "./context/AppContext";
import LoginScreen from "./components/LoginScreen";
import Sidebar from "./components/Sidebar";
import Topbar from "./components/Topbar";
import Toast from "./components/ui/Toast";

import TablesView     from "./components/views/TablesView";
import OrderView      from "./components/views/OrderView";
import TakeawayView   from "./components/views/TakeawayView";
import OnlineOrdersView from "./components/views/OnlineOrdersView";
import StockView      from "./components/views/StockView";
import MenuView       from "./components/views/MenuView";
import ReportsView    from "./components/views/ReportsView";
import UsersView      from "./components/views/UsersView";
import SettingsView   from "./components/views/SettingsView";

function AppShell() {
  const { currentUser, currentView } = useApp();

  if (!currentUser) return <LoginScreen />;

  const VIEW_MAP: Record<string, React.ReactNode> = {
    tables:   <TablesView />,
    order:    <OrderView />,
    takeaway: <TakeawayView />,
    online:   <OnlineOrdersView />,
    stock:    <StockView />,
    menu:     <MenuView />,
    reports:  <ReportsView />,
    users:    <UsersView />,
    settings: <SettingsView />,
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#F5F4FA]">
      <Sidebar />
      <div className="flex flex-col flex-1 min-w-0 h-full">
        <Topbar />
        <main
          key={currentView}
          className="flex-1 overflow-y-auto p-4 md:p-6 animate-[fadeInUp_.25s_ease] pb-20 md:pb-6"
        >
          {VIEW_MAP[currentView] ?? <TablesView />}
        </main>
      </div>
      <Toast />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppShell />
    </AppProvider>
  );
}
