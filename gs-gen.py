################################################################
# Tool Name :: Gallery Sekiryu HP Generator (gs-gen.py)
# Author	:: shinji.you@gmail.com
# Update    :: 2020/MM/DD Renewed to execute on Python
#
import sys
import pprint
import os
import re

import xlrd
from flask import Flask, render_template
from jinja2 import Template, Environment, FileSystemLoader

VERSION = 'v3.00'
YKPRINT_MAX = 32

L_SITEMAP = ('about', 'contact', 'search', 'site', 'privacy',
	'404', 'exhibitions', 'exhibitions/past', 'artists', 'art')
L_ARTIST_PAGE = ('y.kusama', 'k.funakoshi', 't.okamoto', 'm.ikeda', 'r.fukui',
		   't.tatsuno', 'k.minami')
D_YK_GREP = {
	'PUMPKIN'	: 'かぼちゃ',
	'FLOWER'	: '花',
	'HAT'		: '帽子',
	'SHOES'		: '靴',
	'BUTTERFLY'	: '蝶',
	'L-SQUASH'	: 'レモンスカッシュ',
	'COFFEE'	: 'コーヒーカップ',
	'FISH'		: '魚',
	'GRAPE'		: 'ぶどう',
	'FRUITS'	: '果物',
	'DOTS'		: '水玉',
	'NETS'		: '網'}

filename = os.path.basename(__file__)

print(f'***********************************************************')
print(f'** Version       : {VERSION}')
print(f'** Program Name  : {filename}')
print(f'***********************************************************')

app = Flask(__name__) #Flaskクラスのインスタンス生成
env = Environment(loader = FileSystemLoader('./templates', encoding='utf8'))

for dir in L_SITEMAP:
	os.makedirs(dir, exist_ok=True)
	os.makedirs('en/' + dir, exist_ok=True)

for dir in L_ARTIST_PAGE:
	os.makedirs('artists/' + dir, exist_ok=True)
	os.makedirs('en/artists/' + dir, exist_ok=True)

os.makedirs('artists/y.kusama_p', exist_ok=True)
os.makedirs('en/artists/y.kusama_p', exist_ok=True)
os.makedirs('artists/y.kusama_g', exist_ok=True)
os.makedirs('en/artists/y.kusama_g', exist_ok=True)

###############################################################################
## 在庫の辞書型リスト(xlxs→ld_zs)の作成
##
wb = xlrd.open_workbook('gs-table.xlsx')
sheet = wb.sheet_by_name('zaiko')

l_2d_all = [sheet.row_values(row) for row in range(sheet.nrows)]

#l_2d_allの一行目は表見出し
l_1d_title = l_2d_all[0]
del l_2d_all[0]   # listから表見出し削除

#タイトル(0行目)に関連する各行の値のdictをlistで作成
ld_zs = []
for l_1d_cur in l_2d_all:
	dict_zs = {}
	for key, val in zip(l_1d_title, l_1d_cur):
		dict_zs[key] = re.sub('\.0$', '', str(val))
	ld_zs.append(dict_zs)


###############################################################################
## 共通ライブラリ定義
##
def plog(*args):
	print('[tarace log] : ', args);
	return

def invalid_param_print(param, num, val):
	print('[INVALID] NUM={},\t{}={}'.format(num, param, val))
	return

def check_zaiko_param(zs):
	plog(sys._getframe().f_code.co_name)
	errcnt = 0
	for dic in zs:
		if not dic.get('DISPLAY') in ['ON', 'OFF']:
			invalid_param_print('DISPLAY', dic['NUM'], dic['DISPLAY'])
			errcnt += 1

		if not re.search('^(B|S)[0-9][0-9]$', dic.get('PRI')):
			invalid_param_print('PRI', dic['NUM'], dic['PRI'])
			errcnt += 1

		if not re.search('^[1-9]$', dic.get('IMGNUM')):
			invalid_param_print('IMGNUM', dic['NUM'], dic['IMGNUM'])
			errcnt += 1

		if not dic.get('TYPE') in ['OTHER', 'PRINT']:
			invalid_param_print('TYPE', dic['NUM'], dic['TYPE'])
			errcnt += 1

	if errcnt != 0:
		print('ERROR={}'.format(errcnt))

	return

def arg_collection(lang):
	ld_zs.sort(key=lambda x: x['HIRAGANA'])
	ld_zs_b = [] #BIG対象 - 重複あり(専門作家以外)
	ld_zs_s = [] #SMALL対象 - 重複あり(専門作家以外)
	d_aname = {} #作家 ID+NAME - 重複なし
	pre_artist = ''

	ld_zs.sort(key=lambda x: x['NUM']) #先にsortしないとis_dupで不整合
	ld_zs.sort(key=lambda x: x['PRI'])
	if lang == 'en/':
		ld_zs.sort(key=lambda x: x['NAME_E'])
	else:
		ld_zs.sort(key=lambda x: x['HIRAGANA'])

	for dic in ld_zs:
		dic['is_dup'] = False
		aid = re.sub('[0-3]$', '', dic['ID']) #k.minami[1-3]が存在するため #TODO
		if dic['DISPLAY'] != 'ON' or aid in L_ARTIST_PAGE:
			continue
		if pre_artist != aid:
			d_aname[dic['ID']] = dic['NAME_E'] if lang =='en/' else dic['NAME']
			dic['is_dup'] = True
		pre_artist = aid

		if re.match('^B[0-9][0-9]$', dic['PRI']):
			ld_zs_b.append(dic)
		if re.match('^S[0-9][0-9]$', dic['PRI']):
			ld_zs_s.append(dic)

	return 'artists', 'COLLECTION', d_aname, ld_zs_b, ld_zs_s

def arg_artist_page(aid, fname, lang):
	minami_x = re.sub('^page_k_', '', fname)
	minami_x = re.sub('.html$', '', minami_x) #TODO
	artist_name = ''
	ld_zs_b = [] #BIG対象
	ld_zs_s = [] #SMALL対象

	ld_zs.sort(key=lambda x: x['NUM'])
	ld_zs.sort(key=lambda x: x['PRI'])

	for dic in ld_zs:
		if dic['DISPLAY'] != 'ON':
			continue
		if dic['TYPE'] == 'PRINT': #y.kusama:PRINT除外
			continue
		if not aid in dic['ID']:
			continue
		if aid == 'k.minami' and not minami_x in dic['ID']: #k.minami[0-3]対応
			continue

		artist_name = dic['NAME_E'] if lang == "en/" else dic['NAME']
		if re.match('^B[0-9][0-9]$', dic['PRI']):
			ld_zs_b.append(dic)
		else:
			ld_zs_s.append(dic)

	return 'artists', artist_name, ld_zs_b, ld_zs_s

def arg_grep_yk(grep_fname, lang):
	grep_id = re.sub('^grep_', '', grep_fname)
	grep_id = re.sub('.html', '', grep_id)
	grep_ja = grep_id if lang == 'en/' else D_YK_GREP[grep_id]
	string_yk = 'Yayoi Kusama - ' if lang == 'en/' else '草間 彌生 - '

	ld_zs.sort(key=lambda x: x['NUM'])
	cnt = 0
	ld_zs_k = []
	for dic in ld_zs:
		if dic['DISPLAY'] != 'ON':
			continue
		if not grep_id in dic['ART_TYPE']: #「FLOWER+BUTTERFLY」の表現あり
			continue
		ld_zs_k.append(dic)

	return 'artists', string_yk + grep_ja, ld_zs_k

def arg_yk_print(yk_fname, lang):
	page_num = re.sub('^yk_print', '', yk_fname)
	page_num = re.sub('.html', '', page_num)
	string_yk = 'Yayoi Kusama - PRINT(' if lang == 'en/' else '草間 彌生 - 版画 ()'

	max = YKPRINT_MAX*int(page_num)
	min = YKPRINT_MAX*(int(page_num)-1)

	ld_zs.sort(key=lambda x: x['NUM'])
	cnt = 0
	ld_zs_k = []
	for dic in ld_zs:
		if dic['DISPLAY'] != 'ON':
			continue
		if dic['TYPE'] != 'PRINT':
			continue
		#Page番号の作品を絞り込む(4x8単位) ex) 3Page目は 65～96
		cnt += 1
		if not (min < cnt <= max):
			continue
		ld_zs_k.append(dic)

	return 'artists', string_yk + page_num + '）', int(page_num), ld_zs_k


def arg_art_detail(artid_f, lang):
	anum = re.sub('_.*\.html', '', artid_f)
	apage = False

	d_zs_ad = {}
	for dic in ld_zs:
		if dic['DISPLAY'] != 'ON':
			continue
		if dic['NUM'] == anum:
			artist_name = dic['NAME_E'] if lang == 'en/' else dic['NAME']
			d_zs_ad = dic
			break

	if d_zs_ad['ID'] in L_ARTIST_PAGE:
		apage = re.sub('\.', '_', d_zs_ad['ID'])

	d_zs_ad['IMGNUM'] = int(d_zs_ad['IMGNUM'])

	return 'art', artist_name, apage, d_zs_ad


###############################################################################
## HTMLファイル出力用関数
##
def gen_index_html(lang):
	plog(sys._getframe().f_code.co_name, lang)
	template = env.get_template('/' + lang + 'index.html')
	with open(lang + 'index.html', mode='w', encoding='utf-8') as f:
		f.write(template.render(page_type='index'))
	return

def gen_base_site_html(site_dir, lang):
	plog(sys._getframe().f_code.co_name, site_dir, lang)
	template = env.get_template('/' + lang + site_dir + '/index.html')
	with open(lang + site_dir + '/index.html', mode='w', encoding='utf-8') as f:
		f.write(template.render(page_type=site_dir))
	return

def gen_collection_html(lang):
	plog(sys._getframe().f_code.co_name, lang)
	template = env.get_template('/' + lang + 'artists/index.html')
	page_type, aname, d_artists, ld_b, ld_s = arg_collection(lang)
	with open(lang + 'artists/index.html', mode='w', encoding='utf-8') as f:
		f.write(template.render(page_type=page_type, aname=aname,
			d_artists=d_artists, ld_b=ld_b, ld_s=ld_s))
	return

def gen_artist_page_html(aid, fname, lang):
	plog(sys._getframe().f_code.co_name, aid, fname, lang)
	path = lang + 'artists/' + aid + '/' + fname
	template = env.get_template('/' + path)
	page_type, aname, ld_b, ld_s = arg_artist_page(aid, fname, lang)
	with open(path, mode='w', encoding='utf-8') as f:
		f.write(template.render(page_type=page_type, aname=aname,
				file_name=fname, ld_b=ld_b, ld_s=ld_s))
	return

def gen_grep_yk_html(grep_fname, lang):
	plog(sys._getframe().f_code.co_name, grep_fname, lang)
	path = lang + 'artists/y.kusama_g/' + grep_fname
	template = env.get_template('/' + lang + 'artists/y.kusama_g/grep_yk.html/')
	page_type, aname, ld_k = arg_grep_yk(grep_fname, lang) #テンプレートと出力ファイル名が異なる
	with open(path, mode='w', encoding='utf-8') as f:
		f.write(template.render(page_type=page_type, aname=aname, ld_k=ld_k))
	return


def gen_yk_print_html(yk_fname, lang):
	plog(sys._getframe().f_code.co_name, yk_fname, lang)
	path = lang + 'artists/y.kusama_p/' + yk_fname
	template = env.get_template('/' + lang + 'artists/y.kusama_p/yk_print.html/')
	page_type, aname, page_num, ld_k = arg_yk_print(yk_fname, lang) #テンプレートと出力ファイル名が異なる
	with open(path, mode='w', encoding='utf-8') as f:
		f.write(template.render(page_type=page_type, aname=aname,
				page_number=page_num, ld_k=ld_k))
	return

def gen_art_detail_html(artid_f, lang):
	plog(sys._getframe().f_code.co_name, artid_f, lang)
	template = env.get_template(lang + '/art/art_detail.html')
	page_type, aname, apage, d_ad = arg_art_detail(artid_f, '')
	with open('art/' + artid_f, mode='w', encoding='utf-8') as f:
		f.write(template.render(page_type=page_type, aname=aname, apage=apage, d_ad=d_ad))
	return

#######################################################################
## Flaskデコレーダー定義(DEBUG用)
##
# TODO: 一つの関数に2つ以上のデコレーダーを宣言できない問題のため冗長処理となっている点

@app.route('/') #デコレーダー: URLに対するアクションを登録する
def gen_index():
	plog(sys._getframe().f_code.co_name)
	return render_template('/index.html', page_type='index')

@app.route('/<site_dir>/')
def gen_base_site(site_dir):
	plog(sys._getframe().f_code.co_name, site_dir)
	if site_dir == "en": # '/en/'もこの関数に入るため
		return render_template('/' + site_dir + '/index.html', page_type='index')
	else:
		return render_template('/' + site_dir + '/index.html', page_type=site_dir)

@app.route('/artists/')
def gen_collection():
	plog(sys._getframe().f_code.co_name)
	page_type, aname, d_artists, ld_b, ld_s = arg_collection('')
	return render_template('/artists/index.html', page_type=page_type, aname=aname,
			d_artists=d_artists, ld_b=ld_b, ld_s=ld_s)

@app.route('/en/artists/')
def gen_collection_e():
	plog(sys._getframe().f_code.co_name)
	page_type, aname, d_artists, ld_b, ld_s = arg_collection('en/')
	return render_template('/en/artists/index.html', page_type=page_type, aname=aname,
			d_artists=d_artists, ld_b=ld_b, ld_s=ld_s)

@app.route('/en/<site_dir>/')
def gen_base_site_e(site_dir):
	plog(sys._getframe().f_code.co_name, site_dir)
	return render_template('/en/' + site_dir + '/index.html', page_type=site_dir)

# gen_base_siteのrouteでは起動しなかったので暫定策として関数を用意
@app.route('/exhibitions/past/')
def gen_exhibitions_past():
	plog(sys._getframe().f_code.co_name)
	return render_template('/exhibitions/past/index.html', page_type='exhibitions/past')

@app.route('/en/exhibitions/past/')
def gen_exhibitions_past_e():
	plog(sys._getframe().f_code.co_name)
	return render_template('/en/exhibitions/past/index.html', page_type='exhibitions/past')

@app.route('/artists/<aid>/<fname>/')
def gen_artist_page(aid, fname):
	plog(sys._getframe().f_code.co_name, aid, fname)
	path = '/artists/' + aid + '/' + fname
	page_type, aname, ld_b, ld_s = arg_artist_page(aid, fname, '')
	return render_template(path, page_type=page_type, aname=aname,
		file_name=fname, ld_b=ld_b, ld_s=ld_s)

@app.route('/en/artists/<aid>/<fname>/')
def gen_artist_page_e(aid, fname):
	plog(sys._getframe().f_code.co_name, aid, fname)
	path = '/en/artists/' + aid + '/' + fname
	page_type, aname, ld_b, ld_s = arg_artist_page(aid, fname, 'en/')
	return render_template(path, page_type=page_type, aname=aname,
		file_name=fname, ld_b=ld_b, ld_s=ld_s)

@app.route('/artists/y.kusama_g/<grep_fname>/')
def gen_grep_yk(grep_fname):
	plog(sys._getframe().f_code.co_name, grep_fname)
	page_type, aname, ld_k = arg_grep_yk(grep_fname, '')
	return render_template('/artists/y.kusama_g/grep_yk.html/', page_type=page_type,
		aname=aname, ld_k=ld_k)

@app.route('/en/artists/y.kusama_g/<grep_fname>/')
def gen_grep_yk_e(grep_fname):
	plog(sys._getframe().f_code.co_name, grep_fname)
	page_type, aname, ld_k = arg_grep_yk(grep_fname, 'en/')
	return render_template('en/artists/y.kusama_g/grep_yk.html/', page_type=page_type,
		aname=aname, ld_k=ld_k)

@app.route('/artists/y.kusama_p/<yk_fname>/')
def gen_yk_print(yk_fname):
	plog(sys._getframe().f_code.co_name, yk_fname)
	page_type, aname, page_num, ld_k = arg_yk_print(yk_fname, '')
	return render_template('/artists/y.kusama_p/yk_print.html/', page_type=page_type,
		aname=aname, page_number=page_num, file_name=yk_fname, ld_k=ld_k)

@app.route('/en/artists/y.kusama_p/<yk_fname>/')
def gen_yk_print_e(yk_fname):
	plog(sys._getframe().f_code.co_name, yk_fname)
	page_type, aname, page_num, ld_k = arg_yk_print(yk_fname, 'en/')
	return render_template('/en/artists/y.kusama_p/yk_print.html/', page_type=page_type,
		aname=aname, page_number=page_num, file_name=yk_fname, ld_k=ld_k)

@app.route('/art/<artid_f>')
def gen_art_detail(artid_f):
	plog(sys._getframe().f_code.co_name, artid_f)
	page_type, aname, apage, d_ad = arg_art_detail(artid_f, '')
	return render_template('/art/art_detail.html', page_type=page_type,
		aname=aname, apage=apage, d_ad=d_ad)

@app.route('/en/art/<artid_f>')
def gen_art_detail_e(artid_f):
	plog(sys._getframe().f_code.co_name, artid_f)
	page_type, aname, apage, d_ad = arg_art_detail(artid_f, 'en/')
	return render_template('en/art/art_detail.html', page_type=page_type,
		aname=aname, apage=apage, d_ad=d_ad)

###############################################################################
## MAIN制御 + デバッグ用のFlask起動
##
#def main():

L_LANG=('ja', 'en')

check_zaiko_param(ld_zs)

for l in L_LANG:
	lang = '' if l == 'ja' else l + '/'
	gen_index_html(lang)

	gen_collection_html(lang)

	for site in L_SITEMAP:
		if site == 'artists' or site == 'art':
			continue
		else:
			gen_base_site_html(site, lang)

	for artist in L_ARTIST_PAGE:
		if artist == 'k.minami':
			for i in range(3):
				fname = 'page_' + re.sub('\.', '_', artist) + str(i+1) + '.html'
				gen_artist_page_html(artist, fname, lang)
		else:
			fname = 'page_' + re.sub('\.', '_', artist) + '.html'
			gen_artist_page_html(artist, fname, lang)

	for category in D_YK_GREP:
		gen_grep_yk_html('grep_' + category + '.html', lang)

	for i in range(12):
		gen_yk_print_html('yk_print' + str(i+1) + '.html', lang)


	ld_zs.sort(key=lambda x: x['NUM'])
	for dic in ld_zs:
		if dic['DISPLAY'] != 'ON':
			continue
		gen_art_detail_html(dic['NUM'] + '_' + dic['ID'] + '.html', lang)


if __name__ == '__main__':
	app.run(debug=True, use_reloader=False)
#	app.run(port=4004, debug=config.DEBUG, host='0.0.0.0', use_reloader=False)
