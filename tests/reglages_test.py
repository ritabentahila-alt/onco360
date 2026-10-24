
import base64, struct, zlib, zipfile, io, re
def png(w=60,h=20):
    raw=b''.join(b'\x00'+bytes([30,80,160])*w for _ in range(h)); ch=lambda t,d: struct.pack('>I',len(d))+t+d+struct.pack('>I',zlib.crc32(t+d)&0xffffffff)
    return 'data:image/png;base64,'+base64.b64encode(b'\x89PNG\r\n\x1a\n'+ch(b'IHDR',struct.pack('>IIBBBBB',w,h,8,2,0,0,0))+ch(b'IDAT',zlib.compress(raw))+ch(b'IEND',b'')).decode()
S2=json.loads(json.dumps(S))
for c in ['HGC','HCK','CIOC']: S2[E+'etablissements/'+c]['logo']=png()
S2['utilisateurs/UIDRITA']['signature']=png(40,16)
# un RDV « suivi » prévu hier pour tester « Venu »
pid='PTK1'; R=json.loads(S2[E+'patients/'+pid]['rdvsJson']); R.append({"id":"rTEST","type":"Suivi","d":"2026-10-05","h":"10:00","st":"prevu"}); S2[E+'patients/'+pid]['rdvsJson']=json.dumps(R)
