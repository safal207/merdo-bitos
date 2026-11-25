import {validate,phasePaths} from "./need-graph.mjs";
import {sessionSummary} from "./trust-communication.mjs";
// Experimental read-only opportunity evaluator. Days are explicit integer days on a common scenario clock.
// No scheduling, reservation, payment, notification, or customer profiling.
const F=Object.freeze,day=x=>Number.isSafeInteger(x)&&x>=0;
const stages=["pre_prelaunch","opportunity","transformation","ownership","launch","post_launch"];
const keys=["prepare","opportunity","transformation","ownership","open","close"];
export function launchPhase(calendar,now){
 if(!day(now)||!calendar||keys.some(k=>!day(calendar[k]))||keys.some((k,i)=>i>0&&calendar[k]<=calendar[keys[i-1]]))throw Error("invalid calendar");
 if(now<calendar.prepare)return "before";
 for(let i=keys.length-1;i>=0;i--)if(now>=calendar[keys[i]])return stages[i];
}
export function fulfillment(g,{offer,now,dueDay,availability}){
 if(validate(g).get(offer)?.type!=="offer"||!day(now)||dueDay!==undefined&&!day(dueDay))throw Error("invalid fulfillment context");
 if(dueDay!==undefined&&dueDay<now)return "too_late";
 if(availability==null)return "unknown";
 const a=availability;
 if(a.offer!==offer||!["verified","unknown"].includes(a.status))throw Error("invalid availability");
 if(a.status==="unknown")return "unknown";
 if(!day(a.checkedDay)||!day(a.validThroughDay)||a.validThroughDay<a.checkedDay||!day(a.leadDays)||typeof a.available!=="boolean"||typeof a.source!=="string"||!a.source.trim())throw Error("invalid verification");
 if(now<a.checkedDay||now>a.validThroughDay)return "unknown";
 if(!a.available)return "unavailable";
 if(dueDay===undefined)return "unknown";
 return a.leadDays<=dueDay-now?"feasible":"too_late";
}
export function opportunityWindow(g,session,{calendar,now,phase,anchorDay,fromSpace,toSpace,offer,dueDay,availability}={}){
 const launch=launchPhase(calendar,now);
 if(!session||!session.communication||!session.learning||!session.activation)throw Error("invalid session");
 const c=session.communication,a=session.activation,summary=sessionSummary(session);
 if(anchorDay!==undefined&&!day(anchorDay))throw Error("invalid anchor");
 const capacity=fulfillment(g,{offer,now,dueDay,availability});
 const context=phasePaths(g,{phase,relativeDay:anchorDay===undefined?undefined:now-anchorDay,fromSpace,toSpace,need:c.need==="unknown"?undefined:c.need,customer:"unknown"});
 const relevant=context.contextStatus==="hypothesis_match"&&c.need!=="unknown"&&c.confirmed&&context.rows.some(r=>r.need===c.need&&r.offer===offer);
 // Synthetic intensity never establishes willingness or actual demand. Stale and future snapshots do not qualify.
 const activeNeed=relevant&&a.need===c.need&&a.day===now&&a.status==="active"&&a.intensity>0;
 const authorized=c.active&&c.consent;
 const requested=authorized&&c.decision==="request_discussion";
 const withinLaunch=launch==="launch";
 const understanding=summary.understanding;
 // Understanding is descriptive, not a forced course or a requirement to agree with the vendor.
 const independent=["independent","transfer_demonstrated"].includes(understanding);
 const aligned=withinLaunch&&activeNeed&&capacity==="feasible";
 const canDiscuss=aligned&&requested;
 const reasons=[];
 if(!authorized)reasons.push("no_permission");
 if(!withinLaunch)reasons.push("outside_launch");
 if(context.contextStatus!=="hypothesis_match")reasons.push("context_"+context.contextStatus);
 if(!relevant)reasons.push("need_or_offer_unconfirmed");
 if(!activeNeed)reasons.push("synthetic_need_inactive_or_stale");
 if(capacity!=="feasible")reasons.push("fulfillment_"+capacity);
 if(!requested)reasons.push("no_explicit_discussion_request");
 return F({launch,context:context.contextStatus,capacity,aligned,canDiscuss,understanding,independent,
  decision:c.decision,synthetic:true,status:"hypothesis",reasons:F(reasons),purchaseCreated:false,reservationCreated:false,communicationSent:false,commercialEffect:"unknown"});
}
