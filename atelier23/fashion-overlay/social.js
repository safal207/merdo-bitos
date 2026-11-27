export const X_TAGS = "BuildInPublic,AIEngineering,FashionTech,Menswear,BitOS";
export const X_TEXT = "Explore an interactive premium menswear concept by BitOS.";
export function englishDemoURL(href){
 const u=new URL(href);
 u.search="";u.hash="";u.searchParams.set("lang","en");
 return u.href;
}
export function xIntentURL(href){
 const u=new URL("https://twitter.com/intent/tweet");
 u.searchParams.set("url",englishDemoURL(href));
 u.searchParams.set("text",X_TEXT);
 u.searchParams.set("hashtags",X_TAGS);
 return u.href;
}
