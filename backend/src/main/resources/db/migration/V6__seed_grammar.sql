-- ============================================================================
-- V6 — Seed data: German grammar lessons (theory in Vietnamese with German
-- examples) + 5-question mini quizzes per lesson.
-- quiz shape: [{"prompt": "...", "options": ["..","..","..",".."],
--   "answer_index": 0, "explanation": "..."}, ...]
-- ============================================================================

INSERT INTO grammar_lessons (title, level, content, quiz) VALUES
('Kasus: Nominativ, Akkusativ, Dativ, Genitiv', 'A1', '# Kasus – 4 cách trong tiếng Đức

Danh từ, mạo từ và tính từ trong tiếng Đức biến đổi theo **cách (Kasus)** tùy vai trò trong câu.

## 1. Nominativ (cách 1 – chủ ngữ)
Chủ ngữ của câu, trả lời câu hỏi **wer? / was?** (ai?/cái gì?).
- **Der** Mann kommt. (Người đàn ông đến.)
- **Die** Frau liest. / **Das** Kind spielt. / **Die** Kinder lachen.

## 2. Akkusativ (cách 4 – tân ngữ trực tiếp)
Tân ngữ trực tiếp, trả lời **wen? / was?** (ai?/cái gì? – chịu tác động).
- Ich sehe **den** Mann. (Tôi thấy người đàn ông.)
- Sie kauft **die** Tasche. / Er liest **das** Buch. / Wir besuchen **die** Freunde.
- Mạo từ bất định: einen Mann, eine Frau, ein Kind.

## 3. Dativ (cách 3 – tân ngữ gián tiếp)
Tân ngữ gián tiếp, trả lời **wem?** (cho ai?).
- Ich gebe **dem** Mann das Buch. (Tôi đưa quyển sách cho người đàn ông.)
- Sie hilft **der** Frau. / Er dankt **dem** Kind. / Wir folgen **den** Freunden.
- Mạo từ bất định: einem Mann, einer Frau, einem Kind.

## 4. Genitiv (cách 2 – sở hữu)
Chỉ sự sở hữu, trả lời **wessen?** (của ai?).
- Das Auto **des** Mannes ist neu. (Xe của người đàn ông còn mới.)
- Die Tasche **der** Frau / das Spielzeug **des** Kindes.

## Mẹo nhớ nhanh
- **der → den → dem → des** (giống đực biến đổi nhiều nhất – học thuộc!)
- Giống cái: die → die → der → der
- Giống trung: das → das → dem → des
- Số nhiều: die → die → den (+n) → der
', '[{"prompt": "___ Mann kommt. (chủ ngữ)", "options": ["Der", "Den", "Dem", "Des"], "answer_index": 0, "explanation": "Chủ ngữ (Nominativ) giống đực: der Mann."}, {"prompt": "Ich sehe ___ Mann. (tân ngữ trực tiếp)", "options": ["den", "der", "dem", "des"], "answer_index": 0, "explanation": "Tân ngữ trực tiếp (Akkusativ) giống đực: den Mann."}, {"prompt": "Sie hilft ___ Frau. (giúp ai?)", "options": ["der", "die", "den", "das"], "answer_index": 0, "explanation": "helfen đi với Dativ: der Frau."}, {"prompt": "Das Auto ___ Mannes ist neu. (của ai?)", "options": ["des", "der", "dem", "den"], "answer_index": 0, "explanation": "Sở hữu (Genitiv) giống đực: des Mannes."}, {"prompt": "Wir danken ___ Freunden. (cảm ơn ai – số nhiều)", "options": ["den", "die", "der", "das"], "answer_index": 0, "explanation": "Dativ số nhiều: den Freunden (thêm -n)."}]'::jsonb),
('Konjugation im Präsens (chia động từ thì hiện tại)', 'A1', '# Chia động từ thì hiện tại (Präsens)

## Động từ có quy tắc (schwache Verben)
Bỏ **-en** ở nguyên thể, thêm đuôi theo ngôi:
| Ngôi | Đuôi | Ví dụ: machen |
|---|---|---|
| ich | -e | mache |
| du | -st | machst |
| er/sie/es | -t | macht |
| wir | -en | machen |
| ihr | -t | macht |
| sie/Sie | -en | machen |

## Động từ bất quy tắc (starke Verben)
Một số động từ đổi nguyên âm ở ngôi **du** và **er/sie/es**:
- **essen**: du **isst**, er **isst** (ăn)
- **lesen**: du **liest**, er **liest** (đọc)
- **sprechen**: du **sprichst**, er **spricht** (nói)
- **fahren**: du **fährst**, er **fährt** (lái/đi)
- **sehen**: du **siehst**, er **sieht** (nhìn)

## Động từ đặc biệt
- **sein** (là): ich bin, du bist, er ist, wir sind, ihr seid, sie sind
- **haben** (có): ich habe, du hast, er hat, wir haben, ihr habt, sie haben
- **werden** (trở nên): ich werde, du wirst, er wird, wir werden, ihr werdet, sie werden

## Lưu ý
- Động từ gốc tận cùng bằng **-d/-t** (arbeiten): du arbeit**e**st, er arbeit**e**t (thêm -e- để dễ phát âm).
- Ngôi **Sie** (lịch sự) luôn chia như **sie** (số nhiều): Sie **machen**.
', '[{"prompt": "Ich ___ in Berlin. (wohnen)", "options": ["wohne", "wohnst", "wohnt", "wohnen"], "answer_index": 0, "explanation": "Ngôi ich: bỏ -en thêm -e → wohne."}, {"prompt": "Er ___ gern Pizza. (essen)", "options": ["isst", "essen", "esse", "esst"], "answer_index": 0, "explanation": "essen bất quy tắc: er isst."}, {"prompt": "Du ___ gut Deutsch. (sprechen)", "options": ["sprichst", "sprechen", "spreche", "spricht"], "answer_index": 0, "explanation": "sprechen đổi e→i ở ngôi du: du sprichst."}, {"prompt": "Wir ___ müde. (sein)", "options": ["sind", "seid", "bin", "ist"], "answer_index": 0, "explanation": "sein ngôi wir: sind."}, {"prompt": "Sie (lịch sự) ___ Recht. (haben)", "options": ["haben", "hast", "hat", "habe"], "answer_index": 0, "explanation": "Sie lịch sự chia như sie số nhiều: haben."}]'::jsonb),
('Trennbare Verben (động từ tách được)', 'A1', '# Động từ tách được (trennbare Verben)

Nhiều động từ Đức có **tiền tố tách được** (an-, auf-, aus-, ein-, mit-, vor-, zu-, zurück-, um- ...).

## Quy tắc
- Thì hiện tại & quá khứ đơn: tiền tố **tách ra cuối câu**.
- Nguyên thể & phân từ II: tiền tố **dính liền**.

## Ví dụ
- **anrufen** (gọi điện): Ich **rufe** dich **an**. (Tôi gọi cho bạn.)
- **aufstehen** (thức dậy): Er **steht** um 7 Uhr **auf**.
- **einkaufen** (đi chợ): Wir **kaufen** heute **ein**.
- **mitkommen** (đi cùng): **Kommst** du **mit**?
- **fernsehen** (xem TV): Sie **sieht** abends **fern**.

## Phân từ II
Tiền tố tách được chen **ge-** vào giữa: an**ge**rufen, auf**ge**standen, ein**ge**kauft.
- Ich habe dich **angerufen**.

## Phân biệt
- **umziehen** (chuyển nhà – tách được): Wir **ziehen** um.
- **überziehen** có thể tách hoặc không tùy nghĩa – học theo cụm!
', '[{"prompt": "Ich ___ dich morgen ___. (anrufen)", "options": ["rufe ... an", "anrufe", "rufe ... auf", "an ... rufe"], "answer_index": 0, "explanation": "anrufen tách ra: ich rufe ... an."}, {"prompt": "Er ___ um 7 Uhr ___. (aufstehen)", "options": ["steht ... auf", "aufsteht", "steht ... an", "auf ... steht"], "answer_index": 0, "explanation": "aufstehen: er steht ... auf."}, {"prompt": "___ du mit? (mitkommen)", "options": ["Kommst", "Mitkommst", "Komme mit", "Mit kommst"], "answer_index": 0, "explanation": "Câu hỏi: Kommst du mit?"}, {"prompt": "Ich habe dich gestern ___. (anrufen – Perfekt)", "options": ["angerufen", "anrufen", "gerufen an", "ange-ruft"], "answer_index": 0, "explanation": "Partizip II: ge chen giữa → angerufen."}, {"prompt": "Wir ___ heute im Supermarkt ___. (einkaufen)", "options": ["kaufen ... ein", "einkaufen", "kaufen ... aus", "ein ... kaufen"], "answer_index": 0, "explanation": "einkaufen: wir kaufen ... ein."}]'::jsonb),
('Modalverben (động từ khuyết thiếu)', 'A2', '# Động từ khuyết thiếu (Modalverben)

6 động từ khuyết thiếu: **können, müssen, dürfen, sollen, wollen, möchten**.

## Cấu trúc
**Modalverb (chia) + ... + động từ chính (nguyên thể cuối câu)**
- Ich **kann** gut **schwimmen**. (Tôi bơi giỏi.)
- Du **musst** morgen **arbeiten**. (Bạn phải làm việc ngày mai.)
- Er **darf** hier nicht **rauchen**. (Anh ấy không được hút thuốc ở đây.)

## Chia động từ (Präsens)
| | können | müssen | dürfen |
|---|---|---|---|
| ich | kann | muss | darf |
| du | kannst | musst | darfst |
| er | kann | muss | darf |
| wir | können | müssen | dürfen |

- **sollen**: ich soll, du sollst, er soll (nên – mệnh lệnh/bổn phận)
- **wollen**: ich will, du willst, er will (muốn – ý chí mạnh)
- **möchten**: ich möchte, du möchtest... (muốn – lịch sự, thực chất là Konjunktiv II của mögen)

## Phân biệt quan trọng
- **müssen** (phải – bắt buộc) vs **dürfen** (được phép): Du musst nicht = bạn không cần; Du darfst nicht = bạn không được phép!
- **sollen** (nên – người khác bảo) vs **möchten/wollen** (muốn – mình muốn).
', '[{"prompt": "Ich ___ gut schwimmen. (có thể)", "options": ["kann", "muss", "darf", "soll"], "answer_index": 0, "explanation": "können = có thể: ich kann schwimmen."}, {"prompt": "Du ___ hier nicht rauchen! (không được phép)", "options": ["darfst", "musst", "kannst", "willst"], "answer_index": 0, "explanation": "darf nicht = không được phép."}, {"prompt": "Er ___ morgen arbeiten. (phải – bắt buộc)", "options": ["muss", "darf", "kann", "mag"], "answer_index": 0, "explanation": "müssen = phải (bắt buộc)."}, {"prompt": "___ du einen Kaffee? (muốn – lịch sự)", "options": ["Möchtest", "Musst", "Darfst", "Sollst"], "answer_index": 0, "explanation": "möchten = muốn (lịch sự)."}, {"prompt": "Vị trí động từ chính trong câu có Modalverb:", "options": ["Cuối câu, dạng nguyên thể", "Ngay sau chủ ngữ", "Đầu câu", "Sau modalverb"], "answer_index": 0, "explanation": "Modalverb chia ở vị trí 2, động từ chính nguyên thể cuối câu."}]'::jsonb),
('Perfekt (thì quá khứ hoàn thành – nói)', 'A2', '# Thì Perfekt (quá khứ trong văn nói)

Trong giao tiếp hằng ngày, người Đức dùng **Perfekt** để nói về quá khứ.

## Cấu trúc
**haben/sein (chia ở hiện tại) + Partizip II (cuối câu)**
- Ich **habe** gestern **gekocht**. (Hôm qua tôi đã nấu ăn.)
- Sie **ist** nach Berlin **gefahren**. (Cô ấy đã đi Berlin.)

## haben hay sein?
- **sein** + Partizip II: động từ chỉ **di chuyển** (gehen, fahren, fliegen, kommen) hoặc **thay đổi trạng thái** (aufwachen, einschlafen, sterben).
- Còn lại dùng **haben**.

## Cách tạo Partizip II
- Động từ có quy tắc: **ge- + gốc + -t**: machen → **gemacht**, lernen → **gelernt**.
- Động từ bất quy tắc: **ge- + gốc đổi + -en**: essen → **gegessen**, lesen → **gelesen**, fahren → **gefahren**, sehen → **gesehen**.
- Động từ tách được: ge- chen giữa: **angerufen**, **aufgestanden**.
- Động từ có tiền tố không tách (be-, ver-, er-...): **không có ge-**: besucht, verkauft, erzählt.

## Ví dụ
- Wir **haben** einen Film **gesehen**.
- Er **ist** um 8 Uhr **aufgestanden**.
', '[{"prompt": "Ich ___ gestern viel ___. (arbeiten)", "options": ["habe ... gearbeitet", "bin ... gearbeitet", "habe ... arbeitet", "bin ... arbeiten"], "answer_index": 0, "explanation": "arbeiten không di chuyển → haben + gearbeitet."}, {"prompt": "Sie ___ nach Berlin ___. (fahren)", "options": ["ist ... gefahren", "hat ... gefahren", "ist ... fährt", "hat ... gefahrt"], "answer_index": 0, "explanation": "fahren chỉ di chuyển → sein + gefahren."}, {"prompt": "Partizip II của lesen là:", "options": ["gelesen", "gelest", "gelesen haben", "leset"], "answer_index": 0, "explanation": "lesen bất quy tắc → gelesen."}, {"prompt": "Er ___ mich gestern ___. (anrufen)", "options": ["hat ... angerufen", "ist ... angerufen", "hat ... anrufen", "hat ... gerufen an"], "answer_index": 0, "explanation": "anrufen tách được: hat ... angerufen."}, {"prompt": "Wir ___ den Film schon ___. (sehen)", "options": ["haben ... gesehen", "sind ... gesehen", "haben ... geseht", "sind ... sehen"], "answer_index": 0, "explanation": "sehen không di chuyển → haben + gesehen."}]'::jsonb),
('Komparativ und Superlativ (so sánh)', 'A2', '# So sánh hơn và so sánh nhất

## Komparativ (so sánh hơn): ...-er + als
- klein → **kleiner**: Mein Haus ist **kleiner als** deins. (Nhà tôi nhỏ hơn nhà bạn.)
- schnell → **schneller**: Er läuft **schneller als** ich.

Tính từ một âm tiết thường thêm dấu **Umlaut**: alt → **älter**, groß → **größer**, jung → **jünger**.

## Superlativ (so sánh nhất)
- Trước danh từ: **der/die/das + -ste**: der **schnellste** Läufer (vận động viên nhanh nhất).
- Sau động từ: **am + -sten**: Er läuft **am schnellsten**. (Anh ấy chạy nhanh nhất.)

## Hình thức bất quy tắc (học thuộc!)
- gut → **besser** → **am besten** (tốt)
- viel → **mehr** → **am meisten** (nhiều)
- gern → **lieber** → **am liebsten** (thích)
- hoch → **höher** → **am höchsten** (cao)

## Cấu trúc bằng nhau
- **so ... wie**: Er ist **so groß wie** ich. (Anh ấy cao bằng tôi.)
- **nicht so ... wie**: phủ định.
', '[{"prompt": "Mein Bruder ist ___ als ich. (alt)", "options": ["älter", "alter", "am ältesten", "alt"], "answer_index": 0, "explanation": "So sánh hơn của alt: älter (có Umlaut) + als."}, {"prompt": "Er läuft ___. (schnell – nhất)", "options": ["am schnellsten", "der schnellste", "schneller", "schnellste"], "answer_index": 0, "explanation": "Sau động từ: am schnellsten."}, {"prompt": "Das ist der ___ Film des Jahres. (gut)", "options": ["beste", "bessere", "am besten", "gute"], "answer_index": 0, "explanation": "gut bất quy tắc: der beste Film."}, {"prompt": "Ich trinke ___ Tee als Kaffee. (gern)", "options": ["lieber", "gerner", "am liebsten", "gern"], "answer_index": 0, "explanation": "gern → lieber (so sánh hơn)."}, {"prompt": "Sie ist ___ groß wie ihre Schwester.", "options": ["so", "als", "wie", "am"], "answer_index": 0, "explanation": "Cấu trúc bằng nhau: so ... wie."}]'::jsonb),
('Reflexive Verben (động từ phản thân)', 'A2', '# Động từ phản thân (reflexive Verben)

Động từ đi kèm đại từ phản thân **sich**, chỉ hành động quay lại chủ ngữ.

## Đại từ phản thân (Akkusativ)
| Ngôi | Đại từ |
|---|---|
| ich | mich |
| du | dich |
| er/sie/es | sich |
| wir | uns |
| ihr | euch |
| sie/Sie | sich |

## Ví dụ
- Ich **wasche mich**. (Tôi rửa mặt/tắm.)
- Du **beeilst dich**. (Bạn nhanh lên.)
- Er **freut sich** auf den Urlaub. (Anh ấy mong chờ kỳ nghỉ.)
- Wir **erholen uns**. (Chúng tôi nghỉ ngơi.)

## Akkusativ hay Dativ?
- Hầu hết dùng **Akkusativ**: sich waschen, sich freuen, sich beeilen.
- Một số dùng **Dativ** khi đã có tân ngữ Akkusativ khác: Ich **wasche mir** die Hände. (Tôi rửa tay – Hände là Akkusativ nên mir là Dativ.)

## Vị trí
- Câu kể: Ich freue **mich** sehr. (đại từ ngay sau động từ chia)
- Câu hỏi: Freust **du dich**?
', '[{"prompt": "Ich wasche ___ jeden Morgen.", "options": ["mich", "dich", "sich", "uns"], "answer_index": 0, "explanation": "Ngôi ich → mich."}, {"prompt": "Er freut ___ auf das Wochenende.", "options": ["sich", "mich", "dich", "uns"], "answer_index": 0, "explanation": "Ngôi er → sich."}, {"prompt": "Beeil ___! Wir sind spät dran.", "options": ["dich", "mich", "sich", "euch"], "answer_index": 0, "explanation": "Mệnh lệnh ngôi du: beeil dich!"}, {"prompt": "Wir erholen ___ am See.", "options": ["uns", "sich", "euch", "mich"], "answer_index": 0, "explanation": "Ngôi wir → uns."}, {"prompt": "Ich wasche ___ die Hände.", "options": ["mir", "mich", "mein", "mir selbst"], "answer_index": 0, "explanation": "Đã có Hände (Akkusativ) nên đại từ phản thân là Dativ: mir."}]'::jsonb),
('Präteritum (quá khứ đơn – văn viết)', 'B1', '# Thì Präteritum (quá khứ đơn)

**Perfekt** dùng trong văn nói; **Präteritum** dùng trong văn viết (báo chí, truyện, tiểu thuyết).

## Cấu trúc
- Động từ có quy tắc: gốc + **-te** + đuôi: ich mach**te**, du mach**test**, er mach**te**, wir mach**ten**.
- Động từ bất quy tắc: **đổi gốc** (học thuộc): ich **ging**, du **gingst**, er **ging**.

## Các động từ bất quy tắc quan trọng
- sein: ich **war**, du warst
- haben: ich **hatte**, du hattest
- werden: ich **wurde**
- gehen → **ging**, kommen → **kam**, sehen → **sah**
- essen → **aß**, trinken → **trank**, lesen → **las**
- fahren → **fuhr**, sprechen → **sprach**, schreiben → **schrieb**

## Ví dụ văn viết
- Es **war** einmal ein König. (Ngày xửa ngày xưa có một vị vua.)
- Er **kam** spät nach Hause und **aß** zu Abend.

## Lưu ý thi cử
- Trong bài thi viết Goethe B1, kể chuyện quá khứ nên dùng **Präteritum** cho mạch truyện chính.
- Modalverben ở quá khứ thường dùng Präteritum: ich **konnte**, ich **musste**, ich **wollte**.
', '[{"prompt": "Es ___ einmal ein König. (sein)", "options": ["war", "ist", "wäre", "sei"], "answer_index": 0, "explanation": "Präteritum của sein: ich/er war."}, {"prompt": "Er ___ spät nach Hause. (kommen)", "options": ["kam", "kommt", "käm", "gekommen"], "answer_index": 0, "explanation": "kommen → kam (Präteritum)."}, {"prompt": "Ich ___ gestern viel. (arbeiten – quy tắc)", "options": ["arbeitete", "arbeite", "gearbeitet", "arbeiten"], "answer_index": 0, "explanation": "Động từ quy tắc: arbeitete."}, {"prompt": "Sie ___ nicht kommen. (können – quá khứ)", "options": ["konnte", "kann", "könnte", "gekonnt"], "answer_index": 0, "explanation": "Modalverb quá khứ dùng Präteritum: konnte."}, {"prompt": "Wir ___ den ganzen Abend. (lesen)", "options": ["lasen", "lesen", "läsen", "gelesen"], "answer_index": 0, "explanation": "lesen → lasen (Präteritum số nhiều)."}]'::jsonb),
('Adjektivdeklination (biến cách tính từ)', 'B1', '# Biến cách tính từ (Adjektivdeklination)

Tính từ đứng **trước danh từ** phải biến đổi đuôi theo giống, cách và loại mạo từ.

## 1. Sau mạo từ xác định (der/die/das) – biến cách yếu
Đuôi chỉ có **-e** hoặc **-en**:
- Nominativ: der nett**e** Mann, die nett**e** Frau, das nett**e** Kind, die nett**en** Kinder
- Các cách còn lại: **-en** (den netten Mann, dem netten Mann...)

## 2. Sau mạo từ bất định (ein/eine) – biến cách hỗn hợp
- Nominativ: ein nett**er** Mann, eine nett**e** Frau, ein nett**es** Kind
- Akkusativ giống đực: einen nett**en** Mann
- Còn lại giống bảng 1 (đuôi -en).

## 3. Không có mạo từ – biến cách mạnh
Tính từ "gánh" luôn đuôi của mạo từ xác định:
- Nominativ: nett**er** Mann, nett**e** Frau, nett**es** Kind, nett**e** Kinder
- Genitiv: nett**en** Mannes, nett**er** Frau, nett**en** Kindes, nett**er** Kinder
- Dativ: nett**em** Mann, nett**er** Frau, nett**em** Kind, nett**en** Kindern
- Akkusativ: nett**en** Mann, nett**e** Frau, nett**es** Kind, nett**e** Kinder

## Mẹo thi
- Câu hỏi Goethe B1 rất hay ra dạng điền đuôi tính từ. Hãy xác định **giống + cách + có mạo từ gì** trước khi chọn đuôi.
', '[{"prompt": "Das ist ein ___ Mann. (nett – Nom.)", "options": ["netter", "netten", "nettem", "nette"], "answer_index": 0, "explanation": "Sau ein, giống đực Nominativ: netter."}, {"prompt": "Ich sehe den ___ Mann. (nett – Akk.)", "options": ["netten", "netter", "nettem", "nette"], "answer_index": 0, "explanation": "Sau der, Akkusativ: luôn -en → netten."}, {"prompt": "___ Wein schmeckt gut. (kalt – không mạo từ, der Wein)", "options": ["Kalter", "Kalten", "Kaltem", "Kalte"], "answer_index": 0, "explanation": "Không mạo từ, giống đực Nom: kalter (đuôi -er như der)."}, {"prompt": "Mit ___ Freunden. (gut – Dativ số nhiều, không mạo từ)", "options": ["guten", "gute", "guter", "gutem"], "answer_index": 0, "explanation": "Dativ số nhiều: guten (đuôi -en như den)."}, {"prompt": "Die ___ Frau lächelt. (jung – sau die)", "options": ["junge", "jungen", "junger", "jungem"], "answer_index": 0, "explanation": "Sau mạo từ xác định, Nominativ: -e → junge."}]'::jsonb),
('Nebensätze mit weil, dass, wenn', 'B1', '# Mệnh đề phụ với weil, dass, wenn

Mệnh đề phụ (Nebensatz) có **động từ chia đứng cuối câu**.

## 1. weil (bởi vì) – nguyên nhân
- Ich bleibe zu Hause, **weil** ich krank **bin**.
- **Weil** ich krank **bin**, bleibe ich zu Hause. (đảo ngữ ở mệnh đề chính!)

## 2. dass (rằng) – tường thuật
- Er sagt, **dass** er keine Zeit **hat**.
- Ich weiß, **dass** du Recht **hast**.

## 3. wenn (nếu / khi) – điều kiện & thời gian lặp lại
- **Wenn** es **regnet**, bleiben wir zu Hause. (Nếu trời mưa...)
- **Wenn** ich Zeit **habe**, rufe ich an. (Khi tôi có thời gian – lặp lại)
- Phân biệt: **als** dùng cho sự việc **một lần trong quá khứ**: Als ich Kind **war**...

## Trật tự từ
- Mệnh đề phụ đứng trước → mệnh đề chính **đảo ngữ** (động từ lên ngay sau dấu phẩy):
  - Weil ich müde bin, **gehe** ich früh ins Bett.
- Với 2 động từ (Perfekt/Passiv/Modal): động từ chia **cuối cùng**:
  - ..., weil er nicht **kommen konnte**.
', '[{"prompt": "Ich lerne Deutsch, ___ ich in Berlin arbeiten will.", "options": ["weil", "dass", "wenn", "als"], "answer_index": 0, "explanation": "weil chỉ nguyên nhân."}, {"prompt": "Er sagt, ___ er krank ist.", "options": ["dass", "weil", "wenn", "ob"], "answer_index": 0, "explanation": "dass dùng trong tường thuật gián tiếp."}, {"prompt": "___ du Zeit hast, ruf mich an!", "options": ["Wenn", "Weil", "Dass", "Als"], "answer_index": 0, "explanation": "Wenn = nếu (điều kiện)."}, {"prompt": "___ ich ein Kind war, spielte ich viel draußen. (một lần trong quá khứ)", "options": ["Als", "Wenn", "Weil", "Dass"], "answer_index": 0, "explanation": "als cho sự việc một lần trong quá khứ."}, {"prompt": "Weil ich krank bin, ___ ich zu Hause.", "options": ["bleibe", "ich bleibe", "bin bleibe", "bleiben ich"], "answer_index": 0, "explanation": "Mệnh đề phụ đứng trước → mệnh đề chính đảo ngữ: bleibe ich."}]'::jsonb),
('Wechselpräpositionen (giới từ 2 cách)', 'B1', '# Giới từ 2 cách (Wechselpräpositionen)

9 giới từ có thể đi với **Akkusativ** hoặc **Dativ**: **an, auf, hinter, in, neben, über, unter, vor, zwischen**.

## Quy tắc vàng: WO hay WOHIN?
- **Wohin?** (đi đâu – chuyển động có đích) → **Akkusativ**
- **Wo?** (ở đâu – vị trí tĩnh) → **Dativ**

## Ví dụ
- Ich lege das Buch **auf den** Tisch. (Wohin? → Akk.) – Tôi đặt sách lên bàn.
- Das Buch liegt **auf dem** Tisch. (Wo? → Dat.) – Sách nằm trên bàn.
- Er geht **in die** Schule. / Er ist **in der** Schule.
- Sie hängt das Bild **an die** Wand. / Das Bild hängt **an der** Wand.

## Ngoại lệ cần nhớ
- Động từ chỉ vị trí tĩnh luôn Dativ: sitzen, stehen, liegen, hängen, wohnen, sein.
- Động từ chỉ chuyển động có đích luôn Akkusativ: legen, stellen, hängen (treo lên), gehen, fahren.

## Cụm hay gặp
- **im** (= in dem), **am** (= an dem), **ans** (= an das), **ins** (= in das), **aufs** (= auf das).
', '[{"prompt": "Das Buch liegt ___ Tisch. (Wo?)", "options": ["auf dem", "auf den", "auf das", "auf der"], "answer_index": 0, "explanation": "Wo? vị trí tĩnh → Dativ: auf dem Tisch."}, {"prompt": "Ich lege das Buch ___ Tisch. (Wohin?)", "options": ["auf den", "auf dem", "auf der", "auf die"], "answer_index": 0, "explanation": "Wohin? chuyển động → Akkusativ: auf den Tisch."}, {"prompt": "Die Kinder sind ___ Garten.", "options": ["im", "in den", "ins", "in das"], "answer_index": 0, "explanation": "Wo? → in dem = im Garten."}, {"prompt": "Er geht ___ Schule.", "options": ["in die", "in der", "im", "in dem"], "answer_index": 0, "explanation": "Wohin? → in die Schule."}, {"prompt": "Das Bild hängt ___ Wand.", "options": ["an der", "an die", "ans", "an den"], "answer_index": 0, "explanation": "hängen (treo, tĩnh) → Wo? → an der Wand."}]'::jsonb),
('Relativsätze (mệnh đề quan hệ)', 'B1', '# Mệnh đề quan hệ (Relativsätze)

Mệnh đề quan hệ bổ nghĩa cho danh từ, bắt đầu bằng **đại từ quan hệ** và động từ chia cuối câu.

## Đại từ quan hệ = mạo từ xác định (trừ Genitiv & Dativ số nhiều)
| | masc | fem | neut | plural |
|---|---|---|---|---|
| Nom | der | die | das | die |
| Akk | den | die | das | die |
| Dat | dem | der | dem | denen |
| Gen | dessen | deren | dessen | deren |

## Ví dụ
- Der Mann, **der** dort steht, ist mein Vater. (Nom)
- Die Frau, **die** ich gestern **traf**, ist Ärztin. (Akk)
- Das Kind, **dem** ich half, lacht. (Dat)
- Die Studenten, **denen** ich danke, ... (Dat plural – denen!)
- Der Autor, **dessen** Buch ich lese, ... (Genitiv: dessen)

## Dấu phẩy
Mệnh đề quan hệ **luôn** có dấu phẩy ngăn cách với mệnh đề chính.

## Mẹo
- Xác định **giống & số** của danh từ được bổ nghĩa → chọn cột.
- Xác định **vai trò** của đại từ trong mệnh đề quan hệ → chọn hàng (cách).
', '[{"prompt": "Der Mann, ___ dort steht, ist mein Lehrer.", "options": ["der", "den", "dem", "dessen"], "answer_index": 0, "explanation": "der Mann (masc), làm chủ ngữ → der."}, {"prompt": "Die Frau, ___ ich gestern traf, ist Ärztin.", "options": ["die", "der", "den", "deren"], "answer_index": 0, "explanation": "die Frau (fem), tân ngữ trực tiếp → die."}, {"prompt": "Die Kinder, ___ ich die Geschenke gab, ...", "options": ["denen", "die", "der", "den"], "answer_index": 0, "explanation": "Dativ số nhiều: denen."}, {"prompt": "Der Student, ___ Vater Arzt ist, ...", "options": ["dessen", "der", "den", "dem"], "answer_index": 0, "explanation": "Genitiv giống đực: dessen."}, {"prompt": "Das Buch, ___ auf dem Tisch liegt, ...", "options": ["das", "der", "die", "dem"], "answer_index": 0, "explanation": "das Buch (neut), chủ ngữ → das."}]'::jsonb),
('Passiv (câu bị động)', 'B2', '# Câu bị động (Passiv)

## Cấu trúc: werden + Partizip II
- Aktiv: Der Mechaniker **repariert** das Auto.
- Passiv: Das Auto **wird** (vom Mechaniker) **repariert**. (Xe được sửa.)

## Các thì
- Präsens: Das Haus **wird gebaut**.
- Präteritum: Das Haus **wurde gebaut**.
- Perfekt: Das Haus **ist gebaut worden**. (lưu ý: worden, không phải geworden!)
- Plusquamperfekt: Das Haus **war gebaut worden**.
- Futur: Das Haus **wird gebaut werden**.

## Passiv với Modalverb
- Das Problem **muss gelöst werden**. (Vấn đề phải được giải quyết.)
- Die Rechnung **kann bezahlt werden**.

## Tác nhân (von/durch)
- **von** + người: Das Buch wurde **von** Goethe geschrieben.
- **durch** + phương tiện/nguyên nhân: Er wurde **durch** einen Unfall verletzt.

## Khi nào dùng Passiv?
Văn viết trang trọng, báo cáo, khoa học – khi **hành động quan trọng hơn người thực hiện**.
', '[{"prompt": "Das Auto ___ repariert. (hiện tại)", "options": ["wird", "ist", "hat", "wurde"], "answer_index": 0, "explanation": "Passiv Präsens: wird + Partizip II."}, {"prompt": "Das Haus ist letztes Jahr gebaut ___.", "options": ["worden", "geworden", "werden", "wordet"], "answer_index": 0, "explanation": "Perfekt Passiv: ist ... worden."}, {"prompt": "Das Problem ___ gelöst werden. (müssen)", "options": ["muss", "müssen", "musst", "müsst"], "answer_index": 0, "explanation": "Modalverb chia theo chủ ngữ: muss ... werden."}, {"prompt": "Das Buch wurde ___ Goethe geschrieben.", "options": ["von", "durch", "mit", "bei"], "answer_index": 0, "explanation": "Tác nhân là người → von."}, {"prompt": "Die Fenster ___ gestern geputzt. (quá khứ đơn)", "options": ["wurden", "werden", "sind", "haben"], "answer_index": 0, "explanation": "Passiv Präteritum số nhiều: wurden."}]'::jsonb),
('Konjunktiv II (giả định – điều ước)', 'B2', '# Konjunktiv II – câu giả định

## Cách tạo
- Động từ có quy tắc: Präteritum + Umlaut không đổi → dùng **würde + Infinitiv** thay thế:
  - Ich **würde** gern **kommen**. (Tôi muốn đến – ước.)
- Động từ bất quy tắc: Präteritum + Umlaut (a→ä, o→ö, u→ü):
  - haben → **hätte**, sein → **wäre**, werden → **würde**
  - gehen → **ginge**, kommen → **käme**, wissen → **wüsste**
- Modalverben: könnte, müsste, dürfte, sollte, wollte, möchte.

## Câu điều kiện loại 2 (hiện tại – không có thật)
- **Wenn** ich Zeit **hätte**, **käme** ich mit. (Nếu tôi có thời gian, tôi đã đi cùng.)
- Dạng đảo ngữ: **Hätte** ich Zeit, **käme** ich mit.

## Câu điều kiện loại 3 (quá khứ – không có thật)
- Wenn ich gelernt **hätte**, **hätte** ich die Prüfung **bestanden**.
- Hätte er aufgepasst, **wäre** der Unfall nicht **passiert**.

## Các dùng khác
- Ước muốn: Ich **wünschte**, ich **wäre** reich.
- Lịch sự: **Würden** Sie mir **helfen**? / Ich **hätte** gern einen Kaffee.
- So sánh giả định: Er tut so, **als ob** er krank **wäre**.
', '[{"prompt": "Wenn ich Zeit ___, käme ich mit.", "options": ["hätte", "habe", "hatte", "haben"], "answer_index": 0, "explanation": "Điều kiện loại 2: hätte (Konj. II của haben)."}, {"prompt": "Hätte er gelernt, ___ er die Prüfung bestanden.", "options": ["hätte", "hat", "würde", "wird"], "answer_index": 0, "explanation": "Điều kiện loại 3: hätte ... bestanden."}, {"prompt": "Ich ___ gern nach Japan fliegen.", "options": ["würde", "werde", "will", "werdet"], "answer_index": 0, "explanation": "würde + Infinitiv diễn tả ước muốn."}, {"prompt": "___ Sie mir bitte helfen? (lịch sự)", "options": ["Würden", "Werden", "Wollen", "Würdet"], "answer_index": 0, "explanation": "Câu hỏi lịch sự dùng Würden."}, {"prompt": "Er tut so, als ob er alles ___.", "options": ["wüsste", "weiß", "wusste", "wissen"], "answer_index": 0, "explanation": "als ob + Konjunktiv II: wüsste."}]'::jsonb),
('Infinitiv mit zu (động từ nguyên thể với zu)', 'B2', '# Infinitiv mit zu

## Cấu trúc cơ bản
Một số động từ/tính từ yêu cầu **zu + Infinitiv**:
- Ich **versuche**, früh **aufzustehen**. (Tôi cố dậy sớm.)
- Es ist wichtig, pünktlich **zu sein**.
- Er hat **versprochen**, anzurufen.

## Động từ hay gặp + zu
versuchen, vergessen, beginnen, hoffen, vorhaben, bitten, erlauben, verbieten, empfehlen, sich freuen, sich entscheiden, Angst haben.

## Động từ tách được
**zu** chen giữa tiền tố và gốc: **anzurufen**, **aufzustehen**, **einzukaufen**.
- Er vergisst immer, die Tür **abzuschließen**.

## Cụm um ... zu / ohne ... zu / anstatt ... zu
- Ich lerne Deutsch, **um** in Berlin **zu arbeiten**. (để...)
- Er ging weg, **ohne** sich **zu verabschieden**. (mà không...)
- **Anstatt** zu Hause **zu bleiben**, ging er aus. (thay vì...)

## KHÔNG dùng zu sau Modalverben và một số động từ
- Ich kann schwimmen. (không zu!)
- Sau: sehen, hören, lassen, helfen, gehen: Ich **sehe** ihn **kommen**.
', '[{"prompt": "Ich versuche, früh ___. (aufstehen)", "options": ["aufzustehen", "aufstehen", "auf zu stehen", "aufstehe"], "answer_index": 0, "explanation": "Tách được: zu chen giữa → aufzustehen."}, {"prompt": "Ich lerne Deutsch, ___ in Deutschland zu arbeiten.", "options": ["um", "ohne", "anstatt", "für"], "answer_index": 0, "explanation": "um ... zu diễn tả mục đích."}, {"prompt": "Er ging, ___ ein Wort zu sagen.", "options": ["ohne", "um", "anstatt", "mit"], "answer_index": 0, "explanation": "ohne ... zu = mà không..."}, {"prompt": "Câu nào ĐÚNG?", "options": ["Ich kann gut schwimmen.", "Ich kann gut zu schwimmen.", "Ich kann zu gut schwimmen.", "Ich zu kann schwimmen."], "answer_index": 0, "explanation": "Sau Modalverb không dùng zu."}, {"prompt": "Es ist wichtig, pünktlich ___ . (sein)", "options": ["zu sein", "sein", "seien", "zu seien"], "answer_index": 0, "explanation": "Sau tính từ + es ist: zu sein."}]'::jsonb),
('Konjunktiv I – indirekte Rede (tường thuật gián tiếp)', 'C1', '# Konjunktiv I – câu tường thuật gián tiếp

Trong văn viết trang trọng (báo chí, khoa học), lời tường thuật dùng **Konjunktiv I** để thể hiện "người ta nói rằng" mà không khẳng định đúng/sai.

## Cách tạo (từ gốc nguyên thể)
| Ngôi | sein | haben | kommen |
|---|---|---|---|
| ich | sei | habe | komme |
| du | seiest | habest | kommest |
| er | sei | habe | komme |
| wir | seien | haben | kommen |

## Ví dụ báo chí
- Der Minister **sagte**, er **sei** mit dem Ergebnis zufrieden. (Bộ trưởng nói ông hài lòng với kết quả.)
- Die Polizei **berichtet**, die Täter **seien** geflohen.
- Sie **behauptet**, sie **habe** nichts gewusst.

## Khi nào dùng Konjunktiv II thay thế?
Khi dạng Konjunktiv I **trùng với Indikativ** (wir kommen / sie kommen), dùng Konjunktiv II để tránh nhầm:
- Sie sagten, sie **kämen** später. (thay vì kommen)

## Cụm hay gặp
- Es **heiße**, dass ... (Người ta nói rằng...)
- Wie **verlaute**, ... (Theo tin đồn...)
', '[{"prompt": "Er sagt, er ___ krank. (sein – tường thuật)", "options": ["sei", "ist", "wäre", "war"], "answer_index": 0, "explanation": "Konjunktiv I của sein: sei."}, {"prompt": "Sie behauptet, sie ___ nichts gewusst. (haben)", "options": ["habe", "hat", "hätte", "haben"], "answer_index": 0, "explanation": "Konjunktiv I quá khứ: habe gewusst."}, {"prompt": "Die Zeitung meldet, der Täter ___ geflohen. (sein)", "options": ["sei", "ist", "wäre", "seien"], "answer_index": 0, "explanation": "Ngôi er: sei geflohen."}, {"prompt": "Sie sagten, sie ___ später. (kommen – tránh trùng Indikativ)", "options": ["kämen", "kommen", "kamen", "komme"], "answer_index": 0, "explanation": "kommen trùng Indikativ → dùng Konjunktiv II: kämen."}, {"prompt": "Konjunktiv I dùng chủ yếu ở:", "options": ["Báo chí, văn viết trang trọng", "Tin nhắn bạn bè", "Thơ ca", "Quảng cáo"], "answer_index": 0, "explanation": "Konjunktiv I là chuẩn mực của văn viết trang trọng/báo chí."}]'::jsonb),
('Nominalisierung und Nominalstil', 'C1', '# Danh từ hóa & văn phong danh từ (Nominalstil)

Tiếng Đức học thuật ưa dùng **danh từ** thay vì động từ – gọi là Nominalstil.

## Danh từ hóa (Nominalisierung)
- **Động từ → danh từ**: besprechen → die **Besprechung**, entscheiden → die **Entscheidung**, untersuchen → die **Untersuchung**.
- **Tính từ → danh từ**: wichtig → die **Wichtigkeit**, möglich → die **Möglichkeit**.
- Nguyên thể làm danh từ: das **Lesen**, das **Schreiben** (viết hoa!).

## Ví dụ chuyển đổi
- Thường: Weil es viel **regnete**, fiel das Fest aus.
- Học thuật: **Wegen des starken Regens** fiel das Fest aus.
- Thường: Man muss die Daten **sorgfältig prüfen**.
- Học thuật: Es ist eine **sorgfältige Prüfung der Daten** erforderlich.

## Giới từ + Genitiv đặc trưng
- **aufgrund**, **angesichts**, **trotz**, **während**, **wegen**, **infolge**, **mangels** (+ Genitiv):
- **Aufgrund der hohen Kosten** wurde das Projekt gestoppt.
- **Mangels Beweisen** wurde er freigesprochen. (Vì thiếu bằng chứng)

## Lưu ý
Nominalstil làm văn bản **trang trọng, khách quan** nhưng dễ nặng nề – trong bài thi viết C1, dùng vừa phải, kết hợp câu động từ.
', '[{"prompt": "Danh từ hóa của entscheiden là:", "options": ["die Entscheidung", "die Entscheid", "das Entscheiden nur", "der Entscheid"], "answer_index": 0, "explanation": "entscheiden → die Entscheidung."}, {"prompt": "___ der hohen Kosten wurde das Projekt gestoppt.", "options": ["Aufgrund", "Trotz", "Während", "Bei"], "answer_index": 0, "explanation": "aufgrund + Genitiv (vì chi phí cao)."}, {"prompt": "___ Beweisen wurde er freigesprochen. (vì thiếu)", "options": ["Mangels", "Wegen", "Trotz", "Dank"], "answer_index": 0, "explanation": "mangels + Genitiv = vì thiếu."}, {"prompt": "Viết lại học thuật: Weil er krank war, blieb er zu Hause.", "options": ["Wegen seiner Krankheit blieb er zu Hause.", "Weil seiner Krankheit blieb er zu Hause.", "Trotz seiner Krankheit blieb er zu Hause.", "Während seiner Krankheit blieb er zu Hause."], "answer_index": 0, "explanation": "wegen + Genitiv thay mệnh đề weil."}, {"prompt": "Nguyên thể làm danh từ viết thế nào?", "options": ["Viết hoa: das Lesen", "Viết thường: das lesen", "Có -ung: die Lesung", "Không dùng được"], "answer_index": 0, "explanation": "Nguyên thể danh từ hóa viết hoa: das Lesen."}]'::jsonb),
('Partizipialkonstruktionen (cụm phân từ)', 'C2', '# Cụm phân từ (Partizipialkonstruktionen)

Cụm phân từ rút gọn mệnh đề quan hệ, rất phổ biến trong văn học thuật C2.

## Partizip I (đang...)
- Die **lachenden** Kinder (= die Kinder, die lachen)
- Der **in Berlin lebende** Autor (= der Autor, der in Berlin lebt)

## Partizip II (đã bị/được...)
- Die **gestern gelieferte** Ware (= die Ware, die gestern geliefert wurde)
- Der **von Goethe geschriebene** Roman
- Die **mit Handschrift verfasste** Notiz

## Cụm phân từ mở rộng
- **Die von der Kommission im letzten Jahr vorgelegten** Ergebnisse überzeugen nicht.
  (= Die Ergebnisse, die von der Kommission im letzten Jahr vorgelegt wurden, ...)
- **Der sich seit Jahren im Exil befindende** Schriftsteller kehrte zurück.

## Chuyển đổi mệnh đề quan hệ → cụm phân từ
1. Bỏ đại từ quan hệ + trợ động từ.
2. Đưa phân từ (cùng bổ ngữ) lên **trước danh từ**.
3. Phân từ biến cách như tính từ!

## Lưu ý
Cụm phân từ dài làm câu nặng – trong bài thi C2, dùng để thể hiện trình độ nhưng đảm bảo đúng biến cách.
', '[{"prompt": "Die ___ Kinder spielen. (lachen – Partizip I)", "options": ["lachenden", "lachende", "gelachten", "lachend"], "answer_index": 0, "explanation": "Số nhiều Nominativ sau die: lachenden."}, {"prompt": "Der ___ Roman ist berühmt. (von Goethe schreiben – Partizip II)", "options": ["von Goethe geschriebene", "von Goethe geschriebener", "von Goethe geschieben", "Goethe geschriebene"], "answer_index": 0, "explanation": "Giống đực Nom sau der: geschriebene."}, {"prompt": "Rút gọn: Die Ergebnisse, die vorgelegt wurden, überzeugen.", "options": ["Die vorgelegten Ergebnisse überzeugen.", "Die vorgelegt Ergebnisse überzeugen.", "Die vorlegenden Ergebnisse überzeugen.", "Die Ergebnisse vorgelegten überzeugen."], "answer_index": 0, "explanation": "Bỏ mệnh đề quan hệ, phân từ II trước danh từ."}, {"prompt": "Der ___ Schriftsteller kehrte zurück. (sich im Exil befinden)", "options": ["sich im Exil befindende", "sich im Exil befindliche", "im Exil befundene", "sich im Exil befundene"], "answer_index": 0, "explanation": "Partizip I của sich befinden: befindende."}, {"prompt": "Cụm phân từ trong văn học thuật có tác dụng:", "options": ["Rút gọn câu, tăng tính trang trọng", "Làm câu đơn giản hơn", "Thay thế mọi mệnh đề", "Chỉ dùng trong văn nói"], "answer_index": 0, "explanation": "Cụm phân từ cô đọng thông tin, mang tính học thuật."}]'::jsonb),
('Komplexe Satzgefüge & akademische Redemittel', 'C2', '# Câu phức nâng cao & cụm diễn đạt học thuật

## Liên từ & cụm nhượng bộ nâng cao
- **wenngleich** (= obwohl, trang trọng): Wenngleich die Daten lückenhaft sind, ...
- **so ... auch**: So überzeugend das Argument auch klingt, ...
- **ungeachtet** + Genitiv: Ungeachtet aller Kritik hielt er fest.

## Cụm chỉ quan hệ logic
- **insofern ... als**: Insofern ist die These haltbar, als sie empirisch belegt ist.
- **insoweit**: Die Kritik trifft insoweit zu, als ...
- **demzufolge / folglich / mithin**: do đó, hệ quả là.
- **dessen ungeachtet**: mặc dù vậy.

## Redemittel học thuật (mở/kết bài luận)
- **Ziel der vorliegenden Arbeit ist es**, ... (Mục tiêu của bài viết này là...)
- **Im Folgenden wird ... untersucht.** (Sau đây sẽ khảo sát...)
- **Es lässt sich festhalten, dass** ... (Có thể khẳng định rằng...)
- **Zusammenfassend ist zu konstatieren**, dass ... (Tóm lại, có thể nhận định...)
- **Des Weiteren ist anzumerken**, dass ... (Ngoài ra cần lưu ý...)
- **Dies wirft die Frage auf, ob** ... (Điều này đặt ra câu hỏi liệu...)

## Câu điều kiện đảo ngữ nâng cao
- **Sollte** es regnen, fällt das Fest aus. (= Wenn es regnen sollte, ...)
- **Wäre** die Studie valide, müsste man handeln.
', '[{"prompt": "___ aller Kritik hielt er an seinem Plan fest.", "options": ["Ungeachtet", "Trotz", "Wegen", "Während"], "answer_index": 0, "explanation": "ungeachtet + Genitiv (mặc dù mọi chỉ trích)."}, {"prompt": "___ es regnen, fällt das Fest aus. (đảo ngữ điều kiện)", "options": ["Sollte", "Wenn", "Falls", "Ob"], "answer_index": 0, "explanation": "Sollte ... = Wenn es regnen sollte (đảo ngữ)."}, {"prompt": "Cụm mở bài luận học thuật đúng là:", "options": ["Ziel der vorliegenden Arbeit ist es, ...", "Ich will über ... schreiben.", "Mein Thema ist cool.", "Heute schreibe ich über ..."], "answer_index": 0, "explanation": "Redemittel học thuật chuẩn C2."}, {"prompt": "___ ist die These haltbar, als sie belegt ist. (trong chừng mực)", "options": ["Insofern", "Weil", "Obwohl", "Damit"], "answer_index": 0, "explanation": "insofern ... als = trong chừng mực mà..."}, {"prompt": "___ ist anzumerken, dass die Daten unvollständig sind.", "options": ["Des Weiteren", "Außerdem nur", "Und dann", "Weiter so"], "answer_index": 0, "explanation": "Des Weiteren ist anzumerken = ngoài ra cần lưu ý."}]'::jsonb);
