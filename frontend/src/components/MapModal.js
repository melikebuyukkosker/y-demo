import React, { useState, useEffect } from 'react';
import { Modal, Button, Spin } from 'antd';
import { EnvironmentOutlined } from '@ant-design/icons'; // İkon import
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Leaflet Marker için varsayılan ikon ayarı
const defaultIcon = L.icon({
    iconUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon.png',
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon-2x.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
});

// Marker simgesi için varsayılanı ayarla
L.Marker.prototype.options.icon = defaultIcon;

// Harita boyutlarını yeniden hesapla
const UpdateMapSize = () => {
    const map = useMap();
    useEffect(() => {
        map.invalidateSize(); // Haritanın boyutunu yeniden hesaplar
    }, []);
    return null;
};

const MapModal = ({ coordinate }) => {
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [isMapLoading, setIsMapLoading] = useState(true); // Harita yükleme durumunu takip et
    const [lat, lng] = coordinate.split(',').map(Number);

    const showModal = () => {
        setIsModalVisible(true);
    };

    const handleCancel = () => {
        setIsModalVisible(false);
        setIsMapLoading(true); // Modal kapandığında yükleme durumunu sıfırla
    };

    const handleMapLoad = () => {
        setIsMapLoading(false); // Harita yüklendiğinde durum değiştir
    };

    useEffect(() => {
        if (isModalVisible) {
            setTimeout(() => {
                window.dispatchEvent(new Event('resize')); // Tarayıcı yeniden boyutlandırma olayı gönder
            }, 500);
        }
    }, [isModalVisible]);

    return (
        <>
            <Button type="primary" onClick={showModal} icon={<EnvironmentOutlined />}>
                
            </Button>
            <Modal
                title="User's Location"
                open={isModalVisible}
                onCancel={handleCancel}
                footer={null}
                width={800} // Modal genişliği
            >
                <div style={{ position: 'relative', height: '500px', width: '100%' }}>
                    {/* Harita yüklenirken bir Spin göster */}
                    {isMapLoading && (
                        <Spin
                            tip="Loading Map..."
                            style={{
                                position: 'absolute',
                                top: '50%',
                                left: '50%',
                                transform: 'translate(-50%, -50%)',
                                zIndex: 1000,
                            }}
                        />
                    )}
                    {/* Harita Bileşeni */}
                    <MapContainer
                        center={[lat, lng]}
                        zoom={13}
                        style={{ height: '100%', width: '100%' }}
                        whenReady={handleMapLoad} // Harita hazır olduğunda çalışır
                    >
                        <UpdateMapSize /> {/* Harita boyutlarını yeniden hesaplar */}
                        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                        <Marker position={[lat, lng]}>
                            <Popup>User's Location</Popup>
                        </Marker>
                    </MapContainer>
                </div>
            </Modal>
        </>
    );
};

export default MapModal;
