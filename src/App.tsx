import { Routes, Route } from "react-router-dom";
import { ClientExperience } from "./ClientExperience";

export function App() {
  return (
    <Routes>
      <Route path="/clientes" element={<ClientExperience />} />
      <Route path="*" element={<ClientExperience />} />
    </Routes>
  );
}

export default App;
