from cfqpy import *
"""
pa = '/mnt/sdcard/qpython/scripts3/vrak100/'
fav = read_file(pa, 'pref')['favoris']
nam = read_file(pa, 'transit_bkp')
"""

typ, code = 'bus', 'Pc1'
item = ['Porte Dauphine - Marechal de Lattre de Tassigny', 'porte+dauphine+++marechal+de+lattre+de+tassigny']

#typ, code, item = ask(pa, fav, nam)

print(typ, code, item)
data = get_schedules(typ, code, item)
dialog('Horaires', data) 



















