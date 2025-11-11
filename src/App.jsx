import "./App.css";
import LinkPage from "./LinkPage";
import { Toaster } from "react-hot-toast";
import { useEffect } from "react";
import { checkAuthentication } from "./utils/authUtils";

function App() {
  // Clean up any invalid session data on app start
  useEffect(() => {
    checkAuthentication();
  }, []);
 
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
