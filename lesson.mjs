// Authored scenario rules. There is no text classifier or model call.
export const criteria = [
  {id:'ownership', label:'Owned the design and delivery of customer onboarding', relevant:true, policy:'Look for ownership of customer onboarding design and delivery.', feedback:'The role owns onboarding. Check what the person designed and delivered, rather than relying on a title.'},
  {id:'platform', label:'Owned learning-platform workflows, in Workday or another system', relevant:true, policy:'Accept evidence of owning learning-platform workflows in Workday or an equivalent system.', feedback:'The team can teach its tools. Platform ownership is relevant; a particular brand is not required by this brief.'},
  {id:'improvement', label:'Used evidence of customer performance to improve a program', relevant:true, policy:'Ask how the person checked customer performance and used the findings to improve the program. Follow up when that evidence is missing.', feedback:'The brief calls for evidence-based improvement. Course ratings or attendance alone do not show whether customers can do the work.'},
  {id:'brand', label:'Used Workday Learning specifically', relevant:false, policy:'Require experience with Workday Learning specifically.', feedback:'Requiring Workday excludes Maya and Sam even though both owned comparable platform work. This job brief allows training on the tool.'},
  {id:'continuous', label:'Had uninterrupted employment for the past three years', relevant:false, policy:'Require uninterrupted employment for the past three years.', feedback:'Maya and Sam have breaks in employment. The breaks do not answer the job’s questions about ownership or improvement.'},
  {id:'title', label:'Held the exact title “Senior enablement manager”', relevant:false, policy:'Require the exact previous title “Senior enablement manager.”', feedback:'Requiring the title excludes Maya and Sam despite their relevant work. Check responsibilities and evidence.'}
];
export const candidates = [
  {id:'maya',name:'Maya Lin',title:'Customer education lead',facts:{ownership:true,platform:true,improvement:true,brand:false,continuous:false,title:false},evidence:[['Program ownership','Built technical customer onboarding from the first learning path through launch.'],['Platform work','Owned publishing, enrollment workflows, and API integrations in another learning platform.'],['Evidence of improvement','Compared onboarding cohorts, found a setup task that stalled customers, and revised the practice. Reported time-to-value fell 42% and Tier-1 tickets fell 30%.'],['Work history','Six years in customer education; seven-month break after a company-wide layoff. No Workday Learning experience.']]},
  {id:'eli',name:'Eli Brooks',title:'Senior enablement manager',facts:{ownership:null,platform:null,improvement:null,brand:true,continuous:true,title:true},evidence:[['Program ownership','Coordinated webinar calendars and vendor-led courses. Ownership of onboarding design is not described.'],['Platform work','Used Workday Learning reports. Publishing and workflow ownership are not described.'],['Evidence of improvement','Reported attendance and course ratings. Customer performance and resulting program changes are not described.'],['Work history','Five years with the exact title and no break in employment.']]},
  {id:'sam',name:'Sam Rivera',title:'Customer success lead',facts:{ownership:true,platform:true,improvement:true,brand:false,continuous:false,title:false},evidence:[['Program ownership','Designed and launched a self-serve onboarding path with practice for customer admins.'],['Platform work','Owned publishing, automated enrollment, and maintenance in another learning platform.'],['Evidence of improvement','Found repeat errors in customer setup reviews, revised the practice, and tracked a 21% reduction in repeat setup tickets.'],['Work history','Eight years in Customer Success; three-month break between roles. No Workday Learning experience.']]}
];
export function validatePolicy(policy){
  if(!policy || Object.keys(policy).length !== criteria.length || criteria.some(c=>typeof policy[c.id] !== 'boolean')) throw new Error('Choose Require or Leave out for all six rules.');
  return policy;
}
export function evaluatePolicy(policy){
  validatePolicy(policy);
  const issues=criteria.filter(c=>policy[c.id]!==c.relevant);
  const profiles=candidates.map(candidate=>{
    const required=criteria.filter(c=>policy[c.id]);
    const excludedBy=required.filter(c=>candidate.facts[c.id]===false).map(c=>c.id);
    const missing=required.filter(c=>candidate.facts[c.id]===null).map(c=>c.id);
    return {...candidate,excludedBy,missing,status:excludedBy.length?'held':missing.length?'missing':'review'};
  });
  return {aligned:issues.length===0,issues,profiles};
}
export function policyText(policy){
  validatePolicy(policy);
  const active=criteria.filter(c=>policy[c.id]).map(c=>c.policy);
  const omitted=criteria.filter(c=>!c.relevant && !policy[c.id]).map(c=>({brand:'a specific platform brand',continuous:'uninterrupted employment',title:'an exact previous job title'})[c.id]);
  const exclusions=omitted.length>1?`${omitted.slice(0,-1).join(', ')} or ${omitted.at(-1)}`:omitted[0];
  return [...(active.length?active:['No requirements selected. This policy does not check the job brief.']),...(omitted.length?[`Do not exclude a profile solely for lacking ${exclusions}.`]:[]),'These rules organize evidence for human review; they do not establish a hiring decision.'].join(' ');
}
export function evaluateTransfer(choice){
  if(choice==='ask') return {passed:true,feedback:'You identified the missing evidence. Ask how Noor checked customer performance and what changed as a result. The tool match does not fill that gap, and the break and title do not settle it.'};
  if(choice==='advance') return {passed:false,feedback:'Workday experience and ratings are in the profile. What is still missing for the job’s requirement to use customer-performance evidence to improve onboarding?'};
  if(choice==='exclude') return {passed:false,feedback:'Return to the job brief: the break and title do not tell you whether Noor can do this work. Which job-relevant evidence is still missing?'};
  return {passed:false,feedback:'Choose a next step before checking your reasoning.'};
}
