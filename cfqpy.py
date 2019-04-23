import sl4a, json, datetime, urllib.request, re
import unicodedata
droid = sl4a.Android()

def write_file(pa, name, di):
    with open(pa+name+'.json', 'w') as fp:
        json.dump(di, fp, sort_keys=True, indent=4)

def read_file(pa, name):        
    with open(pa+name+'.json', 'r') as fp:
        data = json.load(fp)
    return data

def get_data(url):
    url = unicodedata.normalize('NFD', url).encode('ascii', 'ignore').decode("utf-8")
    response = urllib.request.urlopen(url)
    data = response.read()
    data = data.decode("utf-8")
    data = eval(data)
    return data

def get_trafic():
	url = 'https://api-ratp.pierre-grimaud.fr/v3/traffic'
	data = get_data(url)['result']
	trafic = [[transport+' '+station['line']+' '+station['title'], station['message'], '--'] for transport, info in data.items() for station in info if station['slug'] != 'normal']
	return [i for x in trafic for i in x]

def get_schedules(typ, code, item):
    now = datetime.datetime.now()
    station = item[1] 
    url = 'https://api-ratp.pierre-grimaud.fr/v3/schedules/'+typ+'/'+code.upper()+'/'+station+'/'
    data = [item[0]]
    for way in ('A', 'R'):
        da = get_data(url+way)
        sche = da['result']['schedules']
        dest = sche[0]['destination']
        msg = []
        for d in sche:
            time = d['message']
            if any(char.isdigit() for char in time):
                time = int(re.sub("[^0-9]", "", time)) #+ now.minute
                #if time >= 60:
                    #time = time - 60
                if time < 10:
                    time = '0' + str(time)
            msg.append(str(time))
        msg = ', '.join(msg)
        data = data + ['- '+dest, '---- '+msg]
    return data

def get_station(pa, fn, typ, code):
    data = read_file(pa, fn)
    return data[typ][code]

def dialog(title, lst):
	droid.dialogCreateAlert(title)
	droid.dialogSetItems(lst)
	#droid.dialogSetSingleChoiceItems(lst)
	#droid.dialogSetPositiveButtonText('ok') 
	droid.dialogShow()
	return droid.dialogGetResponse().result	

def ask(pa, fav, nam):
    i = dialog('main', ['favoris', 'find'])
    print(i)
    if i['item'] == 0:
        lst = [x[0]+', '+x[1]+', '+nam[x[0]][x[1]][x[2]][0] for x in fav]
        i = dialog('Favoris', lst)
        typ, code, num = fav[i['item']]
        item = nam[typ][code][num]
    else:
        lst = [k for k in nam]
        i = dialog('find', lst)
        typ = lst[i['item']]
        if typ == 'bus':
            code = droid.dialogGetInput('Ligne').result 
        else:
            lst = [k for k in nam[typ]]
            lst = list(sorted(lst))
            i = dialog(typ, lst)
            code = lst[i['item']]
        lst = [k for k in nam[typ][code]]
        i = dialog(code, [x[0] for x in lst]) 
        item = lst[i['item']]
    return typ, code, item

def update_transit():
    def find_station(typ, code):
        url = 'https://api-ratp.pierre-grimaud.fr/v3/stations/'+typ+'/'+code
        da = get_data(url)
        return [(d['name'], d['slug']) for d in da["result"]["stations"]]
    def find_code(typ):
        url = 'https://api-ratp.pierre-grimaud.fr/v3/lines/'+typ
        da = get_data(url)
        return [(d['name'], d['code']) for d in da["result"][typ]]
    transit = {}
    for typ in ['rers', 'metros', 'bus', 'tramways', 'noctiliens']:
        data = find_code(typ)
        di = {}
        for x in data:
            try:
                st = find_station(typ, x[1].upper())
                di[x[1]] = st
            except:
                continue
            #break
        transit[typ] = di
    write_file(pa, 'transit', transit)


























