import AdGenerator from "./components/AdGenerator";

export default function App() {
  return (
    <div style={{ 
      width: '100%', 
      height: '100%', 
      minHeight: '100vh',
      margin: 0,
      padding: 0,
      boxSizing: 'border-box'
    }}>
      <AdGenerator />
    </div>
  );
}
