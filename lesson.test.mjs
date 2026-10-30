import {test} from 'node:test';
import assert from 'node:assert/strict';
import {criteria,candidates,evaluatePolicy,evaluateTransfer,policyText} from './lesson.mjs';
const aligned={ownership:true,platform:true,improvement:true,brand:false,continuous:false,title:false};
test('job-aligned rules preserve relevant evidence and ask about missing evidence',()=>{
  const result=evaluatePolicy(aligned);assert.equal(result.aligned,true);
  assert.deepEqual(result.profiles.map(p=>[p.id,p.status]),[['maya','review'],['eli','missing'],['sam','review']]);
  assert.deepEqual(result.profiles[1].missing,['ownership','platform','improvement']);
});
test('each irrelevant requirement excludes otherwise relevant profiles',()=>{
  for(const rule of ['brand','continuous','title']){
    const result=evaluatePolicy({...aligned,[rule]:true});assert.equal(result.aligned,false);
    for(const id of ['maya','sam']){const p=result.profiles.find(p=>p.id===id);assert.equal(p.status,'held');assert.deepEqual(p.excludedBy,[rule]);}
  }
});
test('no requirements is not an aligned policy',()=>{assert.equal(evaluatePolicy(Object.fromEntries(criteria.map(c=>[c.id,false]))).aligned,false);});
test('all 64 policies respect the authored evidence and only one matches the brief',()=>{
  let pass=0;
  for(let mask=0;mask<64;mask++){
    const policy=Object.fromEntries(criteria.map((c,i)=>[c.id,Boolean(mask&(1<<i))]));
    const result=evaluatePolicy(policy);if(result.aligned)pass++;
    for(const profile of result.profiles){
      const data=candidates.find(c=>c.id===profile.id),required=criteria.filter(c=>policy[c.id]);
      const expected=required.some(c=>data.facts[c.id]===false)?'held':required.some(c=>data.facts[c.id]===null)?'missing':'review';
      assert.equal(profile.status,expected);
    }
  }
  assert.equal(pass,1);
});
test('free text, incomplete, and unexpected policy fields cannot be graded as a policy',()=>{for(const input of [null,'impact transferable',{}, {...aligned,improvement:undefined},{...aligned,arbitrary:true}])assert.throws(()=>evaluatePolicy(input));});
test('transfer check distinguishes missing evidence from brand matching and exclusion',()=>{assert.equal(evaluateTransfer('ask').passed,true);for(const choice of ['advance','exclude',null,'impact transferable'])assert.equal(evaluateTransfer(choice).passed,false);});
test('generated policy reflects the selected rules rather than a match score',()=>{
  assert.match(policyText(aligned),/Follow up when that evidence is missing/);assert.match(policyText(aligned),/Do not exclude/);assert.doesNotMatch(policyText(aligned),/Require experience with Workday Learning specifically/);assert.match(policyText({...aligned,brand:true}),/Require experience with Workday Learning specifically/);
});
