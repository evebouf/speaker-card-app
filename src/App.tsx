import { useEffect } from "react";
import SpeakerCard from "./SpeakerCard";

function App() {
  useEffect(() => {
    const updateScale = () => {
      const scale = Math.min(
        window.innerWidth / 1120,
        window.innerHeight / 1120
      );
      document.documentElement.style.setProperty(
        "--card-scale",
        String(Math.min(scale, 1))
      );
    };
    updateScale();
    window.addEventListener("resize", updateScale);
    return () => window.removeEventListener("resize", updateScale);
  }, []);

  return <SpeakerCard />;
}

export default App;
