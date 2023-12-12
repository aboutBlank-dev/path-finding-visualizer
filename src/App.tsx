import GridCanvas from "./components/GridCanvas";

function App() {
  return (
    <div className='w-screen h-screen'>
      <GridCanvas cellSize={50}></GridCanvas>;
    </div>
  );
}

export default App;
