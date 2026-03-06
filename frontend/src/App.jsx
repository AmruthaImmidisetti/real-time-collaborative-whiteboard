import { Routes, Route } from "react-router-dom";
import Board from "./pages/Board";

function App() {

  return (

    <Routes>

      <Route
        path="/board/:boardId"
        element={<Board />}
      />

      <Route
        path="/"
        element={<h1>Whiteboard Home</h1>}
      />

    </Routes>

  );
}

export default App;