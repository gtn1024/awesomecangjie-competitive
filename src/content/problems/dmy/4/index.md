---
oj: dmy
pid: '4'
title: '[R1D] 传送'
difficulty: 普及/提高-
tags:
  - 倍增
timeLimit: 1s
memoryLimit: 512m
---

> 数据规模：$1 \le n,q \le 2 \times 10^5$，$1 \le A_i,s_i \le n$，$1 \le c_i \le 10^9$。

## 思路

每个格子的传送目标是固定的，整个图是一个函数图。直接模拟 $c$ 秒会超时，用 **倍增** 解决。

记 $f_j[i]$ 为从格子 $i$ 出发 $2^j$ 秒后所在的位置。预处理：

- $f_0[i] = A_i$
- $f_j[i] = f_{j-1}[f_{j-1}[i]]$（先走 $2^{j-1}$ 秒，再走 $2^{j-1}$ 秒）

回答询问 $(s, c)$ 时，把 $c$ 按二进制拆成若干个 $2$ 的幂，按位累加走即可。$c \le 10^9 < 2^{30}$，所以 $j$ 取 $0..30$ 共 $31$ 层就够。

复杂度：时间 $O((n+q)\log c)$，空间 $O(n \log c)$。

## 仓颉实现

```cangjie
import std.env.*
import std.convert.*

const LOG = 31

main(): Int64 {
    let reader = getStdIn()
    let n = Int64.parse(reader.readln().getOrThrow())
    let stride = n + 1
    var f = Array<Int64>(LOG * stride, { _ => 0 })
    let t = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p => Int64.parse(p) })
    for (i in 1..=n) {
        f[i] = t[i - 1]
    }
    for (j in 1..LOG) {
        let base = j * stride
        let prev = (j - 1) * stride
        for (i in 1..=n) {
            f[base + i] = f[prev + f[prev + i]]
        }
    }
    let q = Int64.parse(reader.readln().getOrThrow())
    var sb = StringBuilder()
    for (_ in 0..q) {
        let sc = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p => Int64.parse(p) })
        var s = sc[0]
        var c = sc[1]
        var bit: Int64 = 0
        while (c > 0) {
            if ((c & 1) == 1) {
                s = f[bit * stride + s]
            }
            c >>= 1
            bit += 1
        }
        sb.append(s.toString())
        sb.append("\n")
    }
    print(sb.toString())
    return 0
}
```

要点：

- 用一维数组 `f[j * stride + i]` 存放倍增表，`stride = n + 1`，避免二维数组带来的额外内存与访问开销。
- 询问较多，答案用 `StringBuilder` 拼接后一次性输出，避免逐行 `println` 的开销。
- 输入行尾可能有多余空格，`split(" ")` 默认保留空串，用 `split(" ", removeEmpty: true)` 过滤。
