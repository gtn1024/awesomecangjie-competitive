---
oj: dmy
pid: '93'
title: '[R16C] 三元组2'
difficulty: 普及/提高-
tags:
  - 枚举
timeLimit: 1s
memoryLimit: 512m
---

> 数据规模：$3 \le n \le 5000$，$1 \le A_i \le 10^9$。

## 思路

题面要求统计满足 $i < j < k$ 且 $\min(A_i, A_k) \le |A_i - A_k|$ 的三元组数量。关键观察是判定条件**只与 $i$、$k$ 有关，与 $j$ 及 $A_j$ 无关**。

对条件做等价变形。不妨设 $A_i \le A_k$，则 $\min(A_i, A_k) = A_i$、$|A_i - A_k| = A_k - A_i$，代入得 $A_i \le A_k - A_i$，即 $2 A_i \le A_k$。综合两种大小关系，原条件等价于

$$\max(A_i, A_k) \ge 2 \cdot \min(A_i, A_k).$$

因此只要固定一对满足条件的 $(i, k)$，所有夹在中间的下标 $j$（$i < j < k$）都合法，这样的 $j$ 共有 $k - i - 1$ 个。于是只需两重循环枚举 $(i, k)$，满足条件就把 $k - i - 1$ 累加进答案。

复杂度：时间 $O(n^2)$，空间 $O(n)$。三元组数量最多约 $n^3 / 6 \approx 2 \times 10^{10}$，答案必须用 `Int64` 累加。

## 仓颉实现

```cangjie
import std.env.*
import std.convert.*

main() {
    let reader = getStdIn()
    let n = Int64.parse(reader.readln().getOrThrow())
    let a = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p => Int64.parse(p) })
    var ans: Int64 = 0
    var i = 0
    while (i < n - 1) {
        let ai = a[i]
        var k = i + 1
        while (k < n) {
            let ak = a[k]
            // 等价于 max(ai, ak) >= 2 * min(ai, ak)
            let lo = if (ai < ak) { ai } else { ak }
            let hi = if (ai < ak) { ak } else { ai }
            if (hi >= lo * 2) {
                ans = ans + (k - i - 1)
            }
            k = k + 1
        }
        i = i + 1
    }
    println(ans)
}
```

要点：

- **条件化简**：把含绝对值和 `min` 的条件归约为 $\max \ge 2\min$，消除分支判断，只需一次比较。
- **降维**：注意到条件与 $j$ 无关后，把 $O(n^3)$ 的三重循环压缩成 $O(n^2)$ 的双重循环，每对合法 $(i, k)$ 贡献 $k - i - 1$ 个 $j$。
- **避免溢出**：$A_i \le 10^9$，$2\min$ 最大 $2 \times 10^9$ 在 `Int64` 范围内；答案最大约 $2 \times 10^{10}$，累加器用 `Int64`。
