/* Network-first service worker: always fresh when online, still works offline (e.g. on the MTR),
   and keeps serving the saved copy if the site itself goes away (404 after the repo turns private). */
const CACHE = 'isom3180-mvpiciev';
const ASSETS = [
 "./",
 "index.html",
 "assets/style.css",
 "assets/app.js",
 "assets/diagrams.js",
 "assets/content.js",
 "manifest.webmanifest",
 "assets/icon-192.png",
 "assets/icon-512.png",
 "img/slides/M1_bw_highway.jpg",
 "img/slides/M1_bw_pipe.jpg",
 "img/slides/M1_components.jpg",
 "img/slides/M1_dotted_decimal.jpg",
 "img/slides/M1_fault_tolerance.jpg",
 "img/slides/M1_intermediary.jpg",
 "img/slides/M1_measurement.jpg",
 "img/slides/M1_representations.jpg",
 "img/slides/M1_topology_diagrams.jpg",
 "img/slides/M2_encapsulation.jpg",
 "img/slides/M2_osi.jpg",
 "img/slides/M2_osi_vs_tcpip.jpg",
 "img/slides/M2_pdu_names.jpg",
 "img/slides/M2_supp_addresses.jpg",
 "img/slides/M2_supp_bus_collision.jpg",
 "img/slides/M2_supp_fcs.jpg",
 "img/slides/M2_tcpip_model.jpg",
 "img/slides/M2_tcpip_suite.jpg",
 "img/slides/M3b_big_diagram.jpg",
 "img/slides/M3b_bridged_broadcast.jpg",
 "img/slides/M3b_broadcast_segmentation.jpg",
 "img/slides/M3b_collision_domains.jpg",
 "img/slides/M3b_comparison_table.jpg",
 "img/slides/M3b_hub_collision.jpg",
 "img/slides/M3b_segmentation_layers.jpg",
 "img/slides/M3b_switch_domains.jpg",
 "img/slides/M3_broadcast_mac.jpg",
 "img/slides/M3_buffering.jpg",
 "img/slides/M3_cam_two_switches.jpg",
 "img/slides/M3_data_flow.jpg",
 "img/slides/M3_dedicated_paths.jpg",
 "img/slides/M3_device_icons.jpg",
 "img/slides/M3_filter.jpg",
 "img/slides/M3_flooding_unknown.jpg",
 "img/slides/M3_forward.jpg",
 "img/slides/M3_hub_operation.jpg",
 "img/slides/M3_mac_structure.jpg",
 "img/slides/M3_multicast_mac.jpg",
 "img/slides/M3_repeated_signal.jpg",
 "img/slides/M3_repeater_layer1.jpg",
 "img/slides/M3_supp_15_domains.jpg",
 "img/slides/M3_supp_broadcast.jpg",
 "img/slides/M3_supp_collisions.jpg",
 "img/slides/M3_supp_mac_table.jpg",
 "img/slides/M3_supp_router.jpg",
 "img/slides/M3_supp_topologies.jpg",
 "img/slides/M3_switches.jpg",
 "img/slides/M3_switch_modes.jpg",
 "img/review/q02.jpg",
 "img/review/q03.jpg",
 "img/review/q04.jpg",
 "img/review/q05.jpg",
 "img/review/q06.jpg",
 "img/review/q08.jpg",
 "img/review/q11.jpg",
 "img/review/q12.jpg",
 "img/review/q16.jpg"
];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (event) => {
  // only drop old caches once the new one is complete, so an offline copy always exists
  event.waitUntil(caches.open(CACHE).then((cache) => cache.keys()).then((have) => (have.length >= ASSETS.length
    ? caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
    : null)).then(() => self.clients.claim()));
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  const fromCache = () => caches.match(event.request).then((hit) => hit || caches.match('index.html'));
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        if (!response.ok) return fromCache().then((hit) => hit || response); // never replace good copies with error pages
        const copy = response.clone();
        caches.open(CACHE).then((cache) => cache.put(event.request, copy));
        return response;
      })
      .catch(fromCache),
  );
});
