import pathlib
data = pathlib.Path(".__final_text.txt").read_text(encoding="utf-8", errors="ignore")
data = data.replace('`n', '\n').replace('`t', '\t')
pathlib.Path("final_doc_processed.txt").write_text(data, encoding="utf-8")
