export const getRoute=()=>location.hash.slice(1)||'dashboard';export const go=route=>{location.hash=route};
