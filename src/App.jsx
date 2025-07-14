import "./App.css";
import LinkPage from "./LinkPage";
import { Toaster } from "react-hot-toast";

function App() {
 
  return (
    <>
    <LinkPage />
    <Toaster position="top-right" />
      {/* Message to open in desktop  */}
      {/* <div className="desktop-message">
        Please open this site on a desktop for the best experience.
      </div> */}
    </>
  );
}

export default App;
