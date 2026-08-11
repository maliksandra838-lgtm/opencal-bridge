# 快速开始

## 1. 先跑合成数据

执行 `npm install`、`npm run dev`，打开本地地址后点击“载入合成示例”。三个状态卡应依次显示：输入检查通过、计量语义检查通过、PTB DCC 3.3.0 XSD 通过。

下载 XML 和 HTML 审计报告。HTML 是自包含文件，离开本工具也能打开。

## 2. 准备自己的副本

复制 `examples/mass/synthetic-mass.csv` 或 `.xlsx`。保留首版固定表头，每一行都重复证书级元数据，再替换合成值。

- `country_code`：两个大写字母，例如 `CN`；
- `language`：`en` 或 `zh`；
- `calibration_date`：`YYYY-MM-DD`；
- 小数点使用英文句点；
- 首版符号约定：`error = indication - reference_value`；
- `expanded_uncertainty >= 0`，`coverage_factor > 0`；
- 文件不超过 10 MiB，XLSX 数据不超过 10,000 行。

## 3. 分层复核

警告不会自动阻断 XML，但必须由技术人员复核。只有阻断性检查通过且真实 XSD 验证成功，XML 下载按钮才启用。

输出 XML 未签名；审计报告不是校准证书。请保留原始数据，并在实验室自己的文件控制流程内评估输出。
