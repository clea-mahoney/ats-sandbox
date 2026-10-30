import {criteria,evaluatePolicy,policyText,evaluateTransfer} from './lesson.mjs';
const $=id=>document.getElementById(id);
let currentPolicy=null, firstResult=null, latestResult=null, attempts=0, transferAttempts=0;
const screens=['policy','review','transfer','finish'];
function showScreen(name){
  screens.forEach(s=>{$(`${s}-screen`).hidden=s!==name;});
  document.querySelectorAll('#steps li').forEach((li,i)=>{if(i===screens.indexOf(name))li.setAttribute('aria-current','step');else li.removeAttribute('aria-current');});
  $(`${name}-heading`).focus();
}
function el(tag,text,className){const node=document.createElement(tag);if(text)node.textContent=text;if(className)node.className=className;return node;}
criteria.forEach(c=>{
  const field=el('fieldset',null,'criterion'); field.append(el('legend',c.label));
  const choices=el('div',null,'criterion-options');
  [['require','Require'],['omit','Leave out']].forEach(([value,text])=>{
    const label=el('label',null,'choice'),input=document.createElement('input');input.type='radio';input.name=c.id;input.value=value;input.required=true;
    label.append(input,document.createTextNode(text));choices.append(label);
  });field.append(choices);$('criteria').append(field);
});
$('policy-form').addEventListener('submit',event=>{
  event.preventDefault();const data=new FormData(event.currentTarget);
  const policy=Object.fromEntries(criteria.map(c=>[c.id,data.get(c.id)==='require']));
  if(criteria.some(c=>!data.has(c.id))){$('form-error').textContent='Choose Require or Leave out for all six rules.';return;}
  try{latestResult=evaluatePolicy(policy);}catch(error){$('form-error').textContent=error.message;return;}
  $('form-error').textContent='';currentPolicy=policy;attempts++;if(!firstResult)firstResult=latestResult;
  renderReview();showScreen('review');
});
function renderReview(){
  const {aligned,profiles,issues}=latestResult;
  $('attempt-label').textContent=`Attempt ${attempts}`;
  $('review-summary').replaceChildren(el('p',aligned?'Your rules match this job brief. Maya and Sam have relevant evidence to review. Eli’s profile needs follow-up questions.':`Your policy has ${issues.length} ${issues.length===1?'rule':'rules'} to revisit. Open the profiles and check what your choices included or missed.`));
  $('candidates').replaceChildren();
  profiles.forEach(candidate=>{
    const card=el('article',null,`candidate ${candidate.status}`);
    const labels={held:'Excluded by your rules',missing:'More evidence needed',review:'Evidence to review'};
    card.append(el('span',labels[candidate.status],'tag'),el('h3',candidate.name),el('p',candidate.title,'small'));
    const reasons=candidate.excludedBy.length?candidate.excludedBy:candidate.missing;
    const shortNames={ownership:'onboarding ownership',platform:'platform ownership',improvement:'evidence-based improvement',brand:'Workday Learning experience',continuous:'uninterrupted employment',title:'the exact prior title'};
    card.append(el('p',reasons.length?`${candidate.excludedBy.length?'Unmet requirements':'Ask about'}: ${reasons.map(id=>shortNames[id]).join('; ')}.`:'The profile contains evidence for each rule you selected. Check those rules against the job brief.','rule-reason'));
    const details=el('details');details.append(el('summary',`Inspect ${candidate.name.split(' ')[0]}’s evidence`));
    const list=el('dl',null,'evidence');candidate.evidence.forEach(([term,fact])=>{const div=el('div');div.append(el('dt',term),el('dd',fact));list.append(div);});details.append(list);card.append(details);$('candidates').append(card);
  });
  const feedback=el('ul');
  if(aligned){feedback.append(el('li','You kept onboarding ownership, platform ownership, and evidence-based improvement. Different tools and titles can still provide that evidence.'),el('li','Eli’s matching tool and title are not enough to fill the gaps in the profile. Missing evidence calls for a question.'));}
  else issues.forEach(c=>feedback.append(el('li',c.feedback)));
  $('rule-feedback').replaceChildren(feedback);$('policy-text').textContent=policyText(currentPolicy);$('transfer').hidden=!aligned;
}
$('revise').addEventListener('click',()=>{$('policy-label').textContent='Revise your policy';$('test-policy').textContent='Test my revised rules';showScreen('policy');});
$('transfer').addEventListener('click',()=>{if(latestResult?.aligned)showScreen('transfer');});
$('back-review').addEventListener('click',()=>showScreen('review'));
$('transfer-form').addEventListener('submit',event=>{
  event.preventDefault();const choice=new FormData(event.currentTarget).get('next-step'),result=evaluateTransfer(choice);
  $('transfer-feedback').textContent=result.feedback;if(choice)transferAttempts++;
  if(!result.passed)return;
  $('final-policy').textContent=policyText(currentPolicy);
  const initiallyHeld=firstResult.profiles.filter(c=>c.status==='held'&&['maya','sam'].includes(c.id)).length;
  const note=initiallyHeld?`Your first policy excluded ${initiallyHeld===1?'one profile':'two profiles'} with relevant evidence. Your revised policy keeps that evidence available for review.`:'Your first policy kept Maya and Sam available for review. You then checked all six rules against the brief.';
  $('learning-summary').replaceChildren(el('p',note),el('p',`You tested ${attempts} ${attempts===1?'policy':'policies'} and completed the new-profile check in ${transferAttempts} ${transferAttempts===1?'attempt':'attempts'}. These counts describe this practice session; they do not measure hiring accuracy.`));
  const reflection=$('reflection').value.trim();$('saved-reflection').hidden=!reflection;$('saved-reflection').textContent=reflection?`Your note: ${reflection}`:'';
  showScreen('finish');
});
$('copy-policy').addEventListener('click',async()=>{
  try{await navigator.clipboard.writeText(policyText(currentPolicy));$('copy-status').textContent='Policy copied.';}
  catch{$('copy-status').textContent='Copy is unavailable here. Select the policy text above to copy it.';}
});
$('restart').addEventListener('click',()=>{
  currentPolicy=firstResult=latestResult=null;attempts=transferAttempts=0;
  $('policy-form').reset();$('transfer-form').reset();$('reflection').value='';$('transfer-feedback').textContent='';$('copy-status').textContent='';$('form-error').textContent='';
  $('policy-label').textContent='Your first attempt';$('test-policy').textContent='Test my rules';showScreen('policy');
});
