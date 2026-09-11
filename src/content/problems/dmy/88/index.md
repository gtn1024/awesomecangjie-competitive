---
oj: dmy
pid: '88'
title: '[R15D] 二维异或和'
difficulty: 普及/提高-
tags:
  - 位运算
  - 前缀和
  - 按位计数
timeLimit: 1s
memoryLimit: 512m
---

> 数据规模：$1 \le n \le 3\times 10^5$，$1 \le q \le 3\times 10^5$，$1 \le A_i \le 10^6$，$1 \le L_i \le R_i \le n$。

## 思路

直接对每个询问两重枚举 $i,j$ 计算复杂度是 $O(qn^2)$，无法承受。关键观察是 **按位独立**：计算 $x \oplus y$ 时，二进制下的每一位互不影响。单独看第 $k$ 位，$A_i \oplus A_j$ 在该位为 $1$，当且仅当 $A_i$ 和 $A_j$ 在该位不同。

设区间 $[L,R]$ 内第 $k$ 位为 $1$ 的元素个数为 $x$，则该位为 $0$ 的元素个数为 $(R-L+1)-x$。要让 $A_i\oplus A_j$ 在第 $k$ 位为 $1$，需要 $i,j$ 在该位一 $1$ 一 $0$。有序对 $(i,j)$ 中 $i$ 为 $1$、$j$ 为 $0$ 有 $x\times ((R-L+1)-x)$ 个，反向（$i$ 为 $0$、$j$ 为 $1$）同样有 $x\times ((R-L+1)-x)$ 个，合计 $2\times x\times ((R-L+1)-x)$ 个，每个贡献 $2^k$。因此整个询问的答案为

$$\sum_{k} 2\times x_k\times ((R-L+1)-x_k)\times 2^k.$$

现在的问题是高效求出 $x_k$，即区间 $[L,R]$ 内第 $k$ 位为 $1$ 的元素个数。维护前缀和 $cnt[k][i]$ 表示前缀 $[1,i]$ 中第 $k$ 位为 $1$ 的个数，则 $x_k = cnt[k][R] - cnt[k][L-1]$，每次询问 $O(1)$。

由于 $A_i \le 10^6 < 2^{20}$，只需枚举 $20$ 位。复杂度：时间 $O((n+q)\log V)$，空间 $O(n\log V)$。

## 仓颉实现

```cangjie
import std.env.*
import std.convert.*

main(): Int64 {
    let reader = getStdIn()
    let line1 = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
    let n = line1[0]
    let q = line1[1]
    let a = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
    // A_i <= 10^6 < 2^20, 需要 20 位 (0..19)
    let B = 20
    // cnt[b][i]: 前缀 i 中第 b 位为 1 的个数
    let cnt = Array<Array<Int64>>(B, { _ => Array<Int64>(n + 1, { _ => 0 }) })
    for (b in 0..B) {
        let mask = Int64(1) << b
        let row = cnt[b]
        for (i in 1..(n + 1)) {
            let add = if ((a[i - 1] & mask) != 0) { 1 } else { 0 }
            row[i] = row[i - 1] + add
        }
    }
    var idx = 0
    while (idx < q) {
        let parts = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
        let l = parts[0]
        let r = parts[1]
        let len = r - l + 1
        var ans = Int64(0)
        for (b in 0..B) {
            let row = cnt[b]
            let x = row[r] - row[l - 1]
            ans += 2 * x * (len - x) * (Int64(1) << b)
        }
        print(ans)
        if (idx < q - 1) {
            print(" ")
        }
        idx++
    }
    println()
    return 0
}
```

要点：

- 逐位构建前缀和：$cnt[b][i]$ 表示 $A_1\sim A_i$ 中第 $b$ 位为 $1$ 的个数，用掩码 `mask = 1 << b` 判断每一位。
- 询问时对每一位用差分 $O(1)$ 取出区间内第 $b$ 位为 $1$ 的个数 $x$，累加 $2\times x\times ((R-L+1)-x)\times 2^b$。系数 $2$ 来自有序对：$(i,j)$ 中 $i$ 为 $1$、$j$ 为 $0$ 有 $x\times ((R-L+1)-x)$ 个，反向同理，两部分配对数相同，合起来翻倍。
- 区间长度 $n\le 3\times 10^5$，答案最大约 $2\times (1.5\times 10^5)^2\times 2^{19}$，用 `Int64` 足够。
