from pypinyin import Style, pinyin


def test_pinyin_with_tones_for_chinese_text():
    result = "".join(item[0] for item in pinyin("你好", style=Style.TONE))

    assert result == "nǐhǎo"
