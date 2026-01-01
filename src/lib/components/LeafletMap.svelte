<script lang="ts">
	import { onMount } from 'svelte';
	import type * as LType from 'leaflet';
	
	interface Props {
		latitude: number;
		longitude: number;
		zoom?: number;
		markerTitle?: string;
		height?: string;
	}
	
	let { latitude, longitude, zoom = 14, markerTitle = '', height = '300px' }: Props = $props();
	
	let mapContainer: HTMLDivElement;
	let map: LType.Map | null = null;
	
	onMount(() => {
		let mounted = true;
		
		// Dynamically import Leaflet only on client
		import('leaflet').then((L) => {
			if (!mounted) return;
			
			// Fix Leaflet default icon issue
			delete (L.Icon.Default.prototype as any)._getIconUrl;
			L.Icon.Default.mergeOptions({
				iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
				iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
				shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
			});
			
			// Create map
			map = L.map(mapContainer).setView([latitude, longitude], zoom);
			
			// Add tile layer
			L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
				attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
			}).addTo(map);
			
			// Add marker
			const marker = L.marker([latitude, longitude]).addTo(map);
			if (markerTitle) {
				marker.bindPopup(markerTitle);
			}
		});
		
		return () => {
			mounted = false;
			map?.remove();
		};
	});
</script>

<svelte:head>
	<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
</svelte:head>

<div class="map-wrapper" style="height: {height}">
	<div bind:this={mapContainer} class="map-container"></div>
</div>

<style>
	.map-wrapper {
		width: 100%;
		border-radius: var(--radius);
		overflow: hidden;
	}
	
	.map-container {
		width: 100%;
		height: 100%;
	}
</style>
