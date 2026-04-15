import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Toaster } from "@/components/ui/toaster";
import Footer from "@/components/Footer";
import { Home } from "@/pages";

function App() {
  return (
    <Router>
      <main className="min-h-screen flex flex-col justify-between bg-black">
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
        </Routes>
        <Footer />
        <Toaster />
      </main>
    </Router>
  );
}

export default App;
