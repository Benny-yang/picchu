from io import StringIO
from html.parser import HTMLParser

class MLStripper(HTMLParser):
    def __init__(self):
        super().__init__()
        self.reset()
        self.strict = False
        self.convert_charrefs = True
        self.text = StringIO()
    def handle_data(self, d):
        self.text.write(d)
    def handle_entityref(self, name):
        pass # Ignored entity refs for pure text
    def handle_charref(self, name):
        pass 
    def get_data(self):
        return self.text.getvalue()

def strip_tags(html):
    s = MLStripper()
    s.feed(html)
    return s.get_data().strip()

# User input text
html_text = """<p>Hi <at id="0">Benny</at>&nbsp;<at id="1">Karen</at>&nbsp;<at id="2">Alan</at></p>
<p>客戶：丸亀 @marukametw&nbsp;</p>
<p>問題：先前客戶有反應過，下載好友資料時，因為資料過多，會造成下載資料超過excel的欄位數</p>
<p>當時是建議客戶先用條件篩選會員/非會員，但客戶今日反應，篩選條件後仍然還是有資料過多的問題</p>
<p>第一次下載等了快半小時最後下載失敗</p>
<p>第二次下載成功，但仍有數值超過列總數因此遺失資料</p>
<p>想詢問是否有其他調整方式呢？</p>
<p>還是可以壓縮檔案？或是當好友數超過一定數量時，在下載檔案時加上加入日期來切割檔案呢？</p>
<p>&nbsp;</p>
<p>非常感謝！</p>
<p>&nbsp;</p>"""

# Replace &nbsp; with a space before parsing
html_text = html_text.replace('&nbsp;', ' ')
clean_text = strip_tags(html_text)
# Remove empty lines that might result from stripping block tags
clean_text = '\n'.join([line.strip() for line in clean_text.split('\n') if line.strip()])
print("--- Cleaned Text ---")
print(clean_text)
