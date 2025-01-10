import { createFileRoute } from "@tanstack/react-router";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import { Container } from "@chakra-ui/react";
import { useGeolocation } from "@uidotdev/usehooks";
import { useCallback, useEffect, useMemo, useState } from "react";
import { MapRef } from "react-leaflet/MapContainer";
import { LatLng } from "leaflet";

export const Route = createFileRoute("/")({
  component: HomeComponent,
});

const position: [number, number] = [52.21126, 20.98183];

function HomeComponent() {
  const [map, setMap] = useState<MapRef>(null);

  useEffect(() => {
    window.dispatchEvent(new Event("resize"));
  }, [map]);

  return (
    <MapContainer
      center={position}
      zoom={13}
      scrollWheelZoom={true}
      className="h-[600px]"
      ref={setMap}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker position={position}>
        <Popup>
          A pretty CSS3 popup. <br /> Easily customizable.
        </Popup>
      </Marker>
    </MapContainer>
  );
}
