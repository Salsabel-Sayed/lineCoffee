import { faCoins, faTags, faWallet } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useTranslation } from 'react-i18next';

function CoinsSection() {
    const { t } = useTranslation();

    return (
        <section id='coinsSection' className="py-5 ">
            <div className="coins">
                <div className="container">
                    <h1>{t("coins.coins_title")}</h1>
                    <p>{t("coins.coins_Des")}</p>
                    <div className="row ">
                        <div className="col-md-4 cardContent  side cardContent glass-section">
                            <div className="coinCard">
                                <div className="coinImg">
                                    <FontAwesomeIcon className='icon' icon={faCoins} />
                                </div>
                                <div className="coinBody">
                                    <h3>{t("product.products_title")}</h3>
                                    <ul>
                                        <li>Lorem ipsum dolor sit amet consectetur </li>
                                        <li>Lorem ipsum dolor sit amet consectetur </li>
                                        <li>Lorem ipsum dolor sit amet consectetur </li>
                                        <li>Lorem ipsum dolor sit amet consectetur </li>
                                    </ul>
                                    <button className='btn btn-outline-dark'>{t("product.description")}</button>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-4 cardContent  middle cardContent glass-section">
                            <div className="coinCard">
                                <div className="coinImg">
                                    <FontAwesomeIcon className='icon' icon={faWallet} />
                                </div>
                                <div className="coinBody">
                                    <h3>{t("product.products_title")}</h3>
                                    <ul>
                                        <li>Lorem ipsum dolor sit amet consectetur </li>
                                        <li>Lorem ipsum dolor sit amet consectetur </li>
                                        <li>Lorem ipsum dolor sit amet consectetur </li>
                                        <li>Lorem ipsum dolor sit amet consectetur </li>
                                    </ul>
                                    <button className='btn btn-outline-dark'>{t("product.description")}</button>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-4 cardContent  side cardContent glass-section">
                            <div className="coinCard">
                                <div className="coinImg">
                                    <FontAwesomeIcon className='icon' icon={faTags} />
                                </div>
                                <div className="coinBody">
                                    <h3>{t("product.products_title")}</h3>
                                    <ul>
                                        <li>Lorem ipsum dolor sit amet consectetur </li>
                                        <li>Lorem ipsum dolor sit amet consectetur </li>
                                        <li>Lorem ipsum dolor sit amet consectetur </li>
                                        <li>Lorem ipsum dolor sit amet consectetur </li>
                                    </ul>
                                    <button className='btn btn-outline-dark'>{t("product.description")}</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

export default CoinsSection;
