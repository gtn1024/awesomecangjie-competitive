---
oj: dmy
pid: '16'
title: '[R3D] 三角形'
difficulty: 普及/提高-
tags:
  - 双指针
  - 排序
timeLimit: 1s
memoryLimit: 512m
---

> 数据规模：$3 \le n \le 10^4$，$1 \le len_i \le 10^9$。

## 思路

木棍排序后，对每对较短的木棍 $i < j$，若最长边取 $k$（$k > j$），构成三角形的条件是 $len_i + len_j > len_k$。

固定 $i$ 时，随着 $j$ 增大，满足条件的最大 $k$ 也单调不减，因此用 **双指针**：对每个 $i$，让 $k$ 随 $j$ 单调右移，每对 $(i,j)$ 的合法 $k$ 的数量为 $k - j - 1$，累加即可。

复杂度：时间 $O(n^2)$，空间 $O(n)$。

## 仓颉实现

<details>
<summary>查看仓颉实现</summary>

```cangjie
import std.env.*
import std.convert.*
import std.sort.*

main() {
    let reader = getStdIn()
    let n = Int64.parse(reader.readln().getOrThrow())
    let a = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p => Int64.parse(p) })
    sort(a)
    var ans: Int64 = 0
    for (i in 0..n) {
        var k = i + 2
        for (j in (i + 1)..(n - 1)) {
            if (k <= j) {
                k = j + 1
            }
            while (k < n && a[i] + a[j] > a[k]) {
                k += 1
            }
            ans += k - j - 1
        }
    }
    println(ans)
}
```

</details>

要点：

- 答案最大为 $\binom{n}{3} \approx 1.7 \times 10^{11}$，用 `Int64` 保存。
- 双指针中 $k$ 随 $j$ 单调不减，注意每轮 $i$ 重置 $k = i+2$。
