import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import socket from "../services/socket";

function Board() {

  const { boardId } = useParams();

  const canvasRef = useRef(null);
  const drawing = useRef(false);
  const [tool, setTool] = useState("pen");

  const [users, setUsers] = useState([]);
  const [cursors, setCursors] = useState({});
  const [objects, setObjects] = useState([]);
  const [undoStack, setUndoStack] = useState([]);
  const [redoStack, setRedoStack] = useState([]);
  const [color, setColor] = useState("black");
  /* JOIN ROOM */

  useEffect(() => {

    socket.emit("joinRoom", { boardId });
    socket.on("objectAdded", (data) => {
        drawRectangle(data);
        setUndoStack(prev => [...prev, data]);
        setRedoStack([]);
        setObjects(prev => [...prev, data]);
      });
    socket.on("roomUsers", ({ users }) => {
      setUsers(users);
    });

    socket.on("cursorUpdate", ({ userId, x, y }) => {

      setCursors(prev => ({
        ...prev,
        [userId]: { x, y }
      }));

    });

    /* RECEIVE DRAW */

    socket.on("drawUpdate", (data) => {
      drawLine(data);
      setUndoStack(prev => [...prev, data]);
      setRedoStack([]);
      setObjects(prev => [...prev, data]);
    });

    return () => {
      socket.off("roomUsers");
      socket.off("cursorUpdate");
      socket.off("drawUpdate");
    };

  }, [boardId]);

  /* DRAW FUNCTION */

  const drawLine = ({ x0, y0, x1, y1, color, size }) => {

    const ctx = canvasRef.current.getContext("2d");

    ctx.strokeStyle = color;
    ctx.lineWidth = size;

    ctx.beginPath();
    ctx.moveTo(x0, y0);
    ctx.lineTo(x1, y1);
    ctx.stroke();
    ctx.closePath();

  };

  const drawRectangle = ({ x, y, width, height, fill }) => {

  const ctx = canvasRef.current.getContext("2d");

  ctx.fillStyle = fill;

  ctx.fillRect(x, y, width, height);

};

const handleUndo = () => {

  if (undoStack.length === 0) return;

  const last = undoStack[undoStack.length - 1];

  const newUndo = undoStack.slice(0, -1);

  setUndoStack(newUndo);
  setRedoStack(prev => [...prev, last]);

  redrawCanvas(newUndo);

};

const handleRedo = () => {

  if (redoStack.length === 0) return;

  const last = redoStack[redoStack.length - 1];

  const newRedo = redoStack.slice(0, -1);

  setRedoStack(newRedo);

  const newObjects = [...objects, last];

  setUndoStack(prev => [...prev, last]);

  redrawCanvas(newObjects);

};

const redrawCanvas = (objs) => {

  const ctx = canvasRef.current.getContext("2d");

  ctx.clearRect(
    0,
    0,
    canvasRef.current.width,
    canvasRef.current.height
  );

  objs.forEach(obj => {

    if (obj.type === "rectangle") {
      drawRectangle(obj);
    } else {
      drawLine(obj);
    }

  });

  setObjects(objs);

};

  /* MOUSE EVENTS */

  const handleMouseDown = (e) => {

  const rect = canvasRef.current.getBoundingClientRect();

  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  if (tool === "pen") {

    drawing.current = true;
    canvasRef.current.lastX = x;
    canvasRef.current.lastY = y;

  }

  if (tool === "rectangle") {

    canvasRef.current.startX = x;
    canvasRef.current.startY = y;

  }

};

  const handleMouseMove = (e) => {

    const x = e.clientX;
    const y = e.clientY;

    socket.emit("cursorMove", { boardId, x, y });

    if (!drawing.current) return;

    const rect = canvasRef.current.getBoundingClientRect();

    const newX = e.clientX - rect.left;
    const newY = e.clientY - rect.top;

    const data = {
  x0: canvasRef.current.lastX,
  y0: canvasRef.current.lastY,
  x1: newX,
  y1: newY,
  color: color,
  size: 2
};

    drawLine(data);

    socket.emit("draw", data);

    setUndoStack(prev => [...prev, data]);
    setRedoStack([]);
    setObjects(prev => [...prev, data]);

    canvasRef.current.lastX = newX;
    canvasRef.current.lastY = newY;

  };

  const handleMouseUp = (e) => {

  if (tool === "pen") {
    drawing.current = false;
  }

  if (tool === "rectangle") {

    const rect = canvasRef.current.getBoundingClientRect();

    const endX = e.clientX - rect.left;
    const endY = e.clientY - rect.top;

    const width = endX - canvasRef.current.startX;
    const height = endY - canvasRef.current.startY;

    const data = {
      type: "rectangle",
      x: canvasRef.current.startX,
      y: canvasRef.current.startY,
      width,
      height,
      fill: color
    };

    drawRectangle(data);

    socket.emit("addObject", data);

    setUndoStack(prev => [...prev, data]);
    setRedoStack([]);
    setObjects(prev => [...prev, data]);
    setTool("pen");
  }

};

  /* TESTING FUNCTION */

  useEffect(() => {

    window.getCanvasAsJSON = () => {
      return { objects };
    };

  }, [objects]);

  return (
    <div>

      <h1>Whiteboard Room</h1>

      <h3>Board ID: {boardId}</h3>

      <h3>Active Users</h3>

      <ul data-testid="user-list">
        {users.map(user => (
          <li key={user.id}>{user.name}</li>
        ))}
      </ul>
        <button onClick={() => setTool("pen")}>Pen Tool</button>
        <button data-testid="tool-rectangle" onClick={() => setTool("rectangle")}>
          Rectangle Tool
        </button>
        <input
          type="color"
          value={color}
          onChange={(e) => setColor(e.target.value)}
        />
        <button data-testid="undo-button" onClick={handleUndo}>
          Undo
        </button>
        <button data-testid="redo-button" onClick={handleRedo}>
          Redo
        </button>
      {/* CANVAS */}

      <canvas
        ref={canvasRef}
        width={1200}
        height={600}
        style={{
          border: "2px solid black",
          cursor: "crosshair"
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      />

      {/* REMOTE CURSORS */}

      {Object.entries(cursors).map(([userId, pos]) => (

        <div
          key={userId}
          data-testid="remote-cursor"
          style={{
            position: "absolute",
            left: pos.x,
            top: pos.y,
            pointerEvents: "none",
            fontSize: "20px"
          }}
        >
          🖱️
        </div>

      ))}

    </div>
  );
}

export default Board;