import ReactDOM from "react-dom/client";
import { HelmetProvider } from "react-helmet-async";
import { ServicesProvider } from "./context/ServicesContext";
import App from "./App";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <ServicesProvider>
   <HelmetProvider>
      <App />
    </HelmetProvider>
  </ServicesProvider>,
);
