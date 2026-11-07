(()=>{
 const paragraphs=[
 '我总觉得，人和人之间的相遇，是一件需要耗费许多运气的事。',
 '在那么漫长的时间里，在无数条本可以永不交汇的人生轨迹中，你们遇见了彼此。或许是许多未曾谋面的岁月，许多阴差阳错的瞬间，才终于换来了这一场相逢。光是想到这里，就已经觉得足够幸运，足够美好。',
 '同时，命运竟然也让我遇见了你们。',
 '于是，两个原本与我的人生毫无交集的人，渐渐成为了我生活里某种温柔而具体的牵挂。我开始为你们的成长欣喜，为你们的挫折难过，为那些旁人看来微不足道的瞬间反复心动。明明隔着那么遥远的距离，情绪却仍然会被你们的一言一行轻易牵动。而我竟也乐在其中，甚至觉得，能够这样远远地看着你们，本身就是一件很幸福的事。',
 '我不知道未来的你们会走向哪里，也不知道许多年后，我们是否还会像今天这样，热切地分享着彼此生命里某段相同的时光。但至少此刻，我真心感谢这场相遇，感谢你们曾经如此鲜活地出现在我的青春里。',
 '而今天，是我们思罕罕小同学的生日。',
 '愿你在往后的日子里，拥有比现在更加广阔的天地，有勇气奔赴想去的远方，也有余裕珍惜身边的风景。愿你被爱，也永远保有爱人的能力；愿你经历成长必经的阵痛，却不必因此失去最初的真诚与热烈。',
 '你不必永远顺遂，不必永远耀眼，也不必成为任何人期待中的模样。',
 '只希望你自由、快乐，坚定地成为自己。',
 '生日快乐，陈思罕。',
 '很高兴你们遇见了彼此，也很高兴，我遇见了你们。'
 ];
 const letters=[
  {title:'suwenduo_来电：',paragraphs,birthdayIndex:9},
  {title:'yybird来电：',paragraphs:[
   '十四岁和十五岁没有什么不同，我的意思是，只要真心放在那里，十五岁和二十五岁也没有区别。',
   '我们用尽全部的力气去爱，又用全部的勇气去忘记，迟迟等不来的那个人，是该从心底划去名字还是一直守护？',
   '我没有答案。',
   '如果你问陈浚铭和陈思罕，他们大概会沉默，然后眯着眼开始回忆，最后在故事里抽丝剥茧，搓搓曾经触碰过的指尖。',
   '写下这个故事，不论真实程度高低，但那些美好却是存在着的。我们抓住这个瞬间，足矣。',
   '生日快乐。'
  ],birthdayIndex:5}
 ];
 window.createEndingLetter=function(host,{speed=1,onComplete=()=>{},onExit=()=>{}}={}){
  let cancelled=false,timer=null,complete=false,follow=true,currentSpeed=speed;
  const overlay=document.createElement('section');
  overlay.className='ending-letter';overlay.setAttribute('role','dialog');overlay.setAttribute('aria-label','suwenduo_与yybird来电');overlay.tabIndex=-1;
  overlay.innerHTML='<div class="ending-letter-scroll"><article><header></header><div class="ending-letter-copy"></div><span class="ending-letter-period" aria-hidden="true">·</span></article></div>';
  host.append(overlay);
  const scroll=overlay.querySelector('.ending-letter-scroll'),copy=overlay.querySelector('.ending-letter-copy');
  const title=overlay.querySelector('header');
  const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  let userScrolling=false;
  const pauseFollow=()=>{userScrolling=true;follow=false;};
  scroll.addEventListener('wheel',event=>{if(event.deltaY<0)pauseFollow();},{passive:true});
  scroll.addEventListener('touchstart',pauseFollow,{passive:true});
  scroll.addEventListener('scroll',()=>{if(userScrolling && scroll.scrollHeight-scroll.scrollTop-scroll.clientHeight<45){follow=true;userScrolling=false;}},{passive:true});
  const delay=ms=>new Promise(resolve=>{timer=setTimeout(resolve,ms/currentSpeed);});
  const reveal=()=>{if(follow)scroll.scrollTop=scroll.scrollHeight;};
  const paragraphNode=(text,index,letter)=>{const p=document.createElement('p');p.textContent=text;if(index===letter.birthdayIndex)p.className='ending-letter-birthday';return p;};
  const fill=()=>{
   title.textContent=letters[0].title;copy.replaceChildren();
   letters.forEach((letter,index)=>{
    if(index){const header=document.createElement('header');header.className='ending-letter-next-title';header.textContent=letter.title;copy.append(header);}
    copy.append(...letter.paragraphs.map((text,i)=>paragraphNode(text,i,letter)));
   });
  };
  function finish(){if(complete)return;complete=true;overlay.dataset.stage='complete';overlay.classList.add('is-complete');onComplete();}
  (async()=>{
   await delay(reduced?0:1100);if(cancelled)return;
   for(let stage=0;stage<letters.length;stage++){
    const letter=letters[stage];overlay.dataset.stage=String(stage);overlay.classList.add('is-visible');title.textContent='';
    for(const character of letter.title){if(cancelled)return;title.textContent+=character;await delay(reduced?0:85);}
    await delay(reduced?0:1100);
    for(let index=0;index<letter.paragraphs.length;index++){
     if(cancelled)return;
     const p=paragraphNode('',index,letter);p.classList.add('is-typing');copy.append(p);
     if(reduced){p.textContent=letter.paragraphs[index];}
     else for(const character of letter.paragraphs[index]){if(cancelled)return;p.append(document.createTextNode(character));reveal();await delay(/[。！？]/.test(character)?380:/[，；：]/.test(character)?160:48);}
     p.classList.remove('is-typing');reveal();
     if(index<letter.paragraphs.length-1)await delay(reduced?0:1100);
    }
    if(stage<letters.length-1){
     overlay.dataset.stage='holding';
     await delay(10000);if(cancelled)return;
     overlay.dataset.stage='fading';
     overlay.style.setProperty('--ending-fade-duration',(reduced?0:3000/currentSpeed)+'ms');
     overlay.classList.add('is-fading');
     await delay(reduced?0:3000);if(cancelled)return;
     overlay.classList.remove('is-visible');copy.replaceChildren();title.textContent='';scroll.scrollTop=0;follow=true;userScrolling=false;
     overlay.classList.remove('is-fading');
     await delay(reduced?0:600);if(cancelled)return;
    }
   }
   if(!cancelled){
    finish();
    await delay(10000);if(cancelled)return;
    overlay.remove();onExit();
   }
  })();
  return {
   element:overlay,
   setSpeed(value){currentSpeed=Math.max(.25,value);},
   showAll(){cancelled=true;clearTimeout(timer);overlay.classList.remove('is-fading');overlay.classList.add('is-visible');fill();scroll.scrollTop=0;finish();},
   destroy(){cancelled=true;clearTimeout(timer);overlay.remove();}
  };
 };
})();
