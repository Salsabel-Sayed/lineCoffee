import { useTranslation } from 'react-i18next';

function HeroSection() {
    const { t } = useTranslation();

    return (
        <section id="heroSection">
            <div className="hero-content">
                <h1 className="display-4 fw-bold mb-3">{t("home.heroTitle")}</h1>
                <p className="lead mb-4">{t("home.heroSubtitle")}</p>
                <a href="#products" className="heroLink">
                    {t("home.seeMore")}
                </a>
            </div>

        </section>
    
    );
}

export default HeroSection;
