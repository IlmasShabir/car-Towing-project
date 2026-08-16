import ReactDOM from "react-dom/client";
import { ServicesProvider } from "./context/ServicesContext";
import App from "./App";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <ServicesProvider>
    <App />
  </ServicesProvider>,
);
