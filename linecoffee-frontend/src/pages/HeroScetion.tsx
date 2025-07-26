import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import AOS from "aos";
import "aos/dist/aos.css"; // ضيفي ده فوق مع باقي الـ imports


function HeroSection() {
    const { t } = useTranslation();
    useEffect(() => {
        AOS.init({
            duration: 1000,
            once: true,
        });
    }, []);

    return (
        <>
            <section id="heroSection">
                <div className="hero-content">
                        <p data-aos="fade-right"
                            data-aos-offset="300"
                            data-aos-duration="1000"
                            data-aos-easing="ease-in-out" className="lead">{t("home.welcomeMessage1")}</p>
                        <p data-aos="fade-right"
                            data-aos-offset="300"
                            data-aos-duration="1500"
                            data-aos-easing="ease-in-out" className="lead">{t("home.welcomeMessage2")}</p>
                        <p data-aos="fade-right"
                            data-aos-offset="300"
                            data-aos-duration="2000"
                            data-aos-easing="ease-in-out" className="lead">{t("home.welcomeMessage3")}</p>
                    <p data-aos="fade-right"
                        data-aos-offset="300"
                        data-aos-duration="2000"
                        data-aos-easing="ease-in-out" className="lead">{t("home.welcomeMessage4")}</p>
                </div>
            </section>



            {/* <section id="heroSection">
                <video
                    autoPlay
                    muted
                    loop
                    playsInline
                    className="video-background"
                >
                    <source src="/public/videos/heroVideo3.mp4" type="video/mp4" />
                    Your browser does not support the video tag.
                </video>

                <div className="hero-content">
                    <h1 className="display-4 fw-bold mb-3">{t("home.heroTitle")}</h1>
                    <p className="lead mb-4">{t("home.heroSubtitle")}</p>
                    <a href="#products" className="heroLink">
                        {t("home.seeMore")}
                    </a>
                </div>
            </section> */}
            
            </>
        

        
    
    );
}

export default HeroSection;
