export function normalizeReleaseNumbering(metadata, reviewed = []){
 const rule=reviewed.find(r=>r.releaseId===metadata.releaseId&&r.catalogId===metadata.catalogId&&r.original===metadata.original&&r.year===metadata.year&&metadata.type==='TV'&&r.count===metadata.episodes);
 if(!rule||!Array.isArray(metadata.episodeNumbers)||metadata.episodeNumbers.length!==rule.count||new Set(metadata.episodeNumbers).size!==rule.count||metadata.episodeNumbers.some(n=>!Number.isInteger(n)||n<=rule.offset||n>rule.offset+rule.count))return metadata;
 return {...metadata,sourceEpisodeNumbers:metadata.episodeNumbers,episodeNumberOffset:rule.offset,episodeNumbers:metadata.episodeNumbers.map(n=>n-rule.offset)};
}
