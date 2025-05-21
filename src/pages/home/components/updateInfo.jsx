import { useTranslation } from 'react-i18next';

export default function UpdateInfo() {
    const { t,i18n } = useTranslation();
    return (
        <div className="update-info">
            <p>Update Info</p>
            <h1>{t('welcome')}</h1>
        </div>
    );
}