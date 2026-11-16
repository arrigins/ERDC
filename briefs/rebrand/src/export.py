from v2page import *
out='/home/user/ERDC/briefs/rebrand/marks/'
def save(name, body, vb='0 0 240 240'):
    open(out+name+'.svg','w').write(f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{vb}">{body}</svg>')
save('ne-mark', ne('A', NE)); save('ne-mark-white', ne('A', dict(a='#fff', b=NE['b'])))
save('stone-mark', stone(ST)); save('stone-etor', stone(dict(a=ST['b']), 'ЕТОР'))
save('ice-mark', ice_east(IC)); save('ice-mark-white', ice_east(dict(a='#fff', b=IC['b'])))
for nm, mk, ink in (('ne', ne('A', NE), NE['a']), ('ice', ice_east(IC), IC['a']), ('stone', stone(ST), ST['a'])):
    s = lockup(mk, ink).replace('<svg ', '<svg xmlns="http://www.w3.org/2000/svg" ', 1)
    open(out+nm+'-lockup.svg','w').write(s)
