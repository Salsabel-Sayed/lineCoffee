import { useEffect } from 'react';
import { subscribeUser } from '../assets/WebPushNote/subscribeUser';


const PushSetup = () => {
    useEffect(() => {
        subscribeUser();
    }, []);

    return null;
};

export default PushSetup;
