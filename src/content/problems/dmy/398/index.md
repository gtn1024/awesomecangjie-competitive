---
oj: dmy
pid: '398'
title: '[R64B] 方形靶'
difficulty: 入门
tags:
  - 模拟
timeLimit: 1s
memoryLimit: 512m
---

> 数据规模：$1 \le n \le 100$，$0 \le a_{i,j} \le 10^9$。

## 思路

按行读入 $n \times n$ 的得分矩阵，再读入 $n$ 行 `X` / `.` 字符。扫描字符矩阵，凡是 `X` 的位置就把对应得分累加到答案。

复杂度：时间 $O(n^2)$，空间 $O(n^2)$。

## 仓颉实现

<details>
<summary>查看仓颉实现</summary>

```cangjie
import std.env.*
import std.convert.*

main() {
    let reader = getStdIn()
    let n = Int64.parse(reader.readln().getOrThrow())
    var a = Array<Int64>(n * n, { _ => 0 })
    for (i in 0..n) {
        let row = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p => Int64.parse(p) })
        for (j in 0..n) {
            a[i * n + j] = row[j]
        }
    }
    var ans: Int64 = 0
    for (i in 0..n) {
        let s = reader.readln().getOrThrow()
        for (j in 0..n) {
            if (s[j] == UInt8(0x58)) {
                ans = ans + a[i * n + j]
            }
        }
    }
    println(ans)
}
```

</details>

要点：

- 得分矩阵展平成一维数组，下标 `i * n + j` 对应第 $i$ 行第 $j$ 列。
- `X` 的 ASCII 码是 `0x58`，字符矩阵逐字节判断即可。
- 单格得分可达 $10^9$，总得分约 $10^{13}$，用 `Int64` 累加。
