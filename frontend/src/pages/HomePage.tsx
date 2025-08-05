import HeaderSection from "../components/ui/Header";
import Footer from "../components/ui/Footer";
import HomeIntroSection from "../components/ui/HomeIntroSection";
import { useNavigate } from "react-router-dom";
import { getToken } from "../api/auth";

const HomePage = () => {
  const navigate = useNavigate();
  const isLoggedIn = !!getToken();

  return (
    <>
      <div className="flex flex-col min-h-screen bg-gradient-to-br from-[#0A0F1C] via-[#1A1F2C] to-[#0A0F1C] relative">
        {/* Background texture overlay */}
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%2361B044' fill-opacity='0.03'%3E%3Ccircle cx='30' cy='30' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        ></div>

        {/* Subtle grid pattern */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `linear-gradient(rgba(97,176,68,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(97,176,68,0.02) 1px, transparent 1px)`,
            backgroundSize: "20px 20px",
          }}
        ></div>

        {/* Content */}
        <div className="relative z-10 flex flex-col min-h-screen">
          <HeaderSection />
          <main className="flex-grow overflow-y-auto pt-16 pb-20">
            <HomeIntroSection />
          </main>
          <Footer />
        </div>
      </div>
    </>
  );
};

export default HomePage;
