---
oj: dmy
pid: '418'
title: '[R67D] 有趣值'
difficulty: 普及+/提高
tags:
  - 排序
  - 数学
timeLimit: 1s
memoryLimit: 512m
---

> 数据规模：$1 \le n \le 10^6$，$1 \le a_i \le 10^9$。

## 思路

先化简数对的有趣值。若 $a_i \ge a_j$，则：

$$
|a_i-a_j|(a_i+a_j)=(a_i-a_j)(a_i+a_j)=a_i^2-a_j^2
$$

$a_i < a_j$ 时同理可得 $a_j^2-a_i^2$。也就是说，无论大小关系如何，有趣值**总是较大数的平方减去较小数的平方**。

于是把数组排序，设排序后为 $b_1 \le b_2 \le \cdots \le b_n$，对任意 $i<j$，数对 $(b_i,b_j)$ 的有趣值为 $b_j^2-b_i^2$，总和为：

$$
\sum_{i=1}^{n}\sum_{j=i+1}^{n}(b_j^2-b_i^2)
$$

按元素 $b_k$ 统计贡献：作为较大值（与前面 $k-1$ 个元素配对）出现 $k-1$ 次，贡献 $+b_k^2$；作为较小值（与后面 $n-k$ 个元素配对）出现 $n-k$ 次，贡献 $-b_k^2$。总贡献系数为：

$$
(k-1)-(n-k)=2k-n-1
$$

答案即为：

$$
\sum_{k=1}^{n}(2k-n-1)\cdot b_k^2
$$

相同元素无需特殊处理，因为它们的贡献会相互抵消。实现时注意 $b_k \le 10^9$，$b_k^2$ 可达 $10^{18}$，需先对 $b_k$ 取模再平方；系数 $2k-n-1$ 可能为负，取模后要加模数转成正数，再与平方取模相乘并累加。

复杂度：时间 $O(n \log n)$（排序），空间 $O(n)$。

## 仓颉实现

<details>
<summary>查看仓颉实现</summary>

```cangjie
import std.env.*
import std.convert.*
import std.sort.*

main() {
    let reader = getStdIn()
    let n = Int64.parse(reader.readln().getOrThrow().split(" ", removeEmpty: true)[0])
    let a = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
    sort(a)
    let MOD = 1000000007
    let nn = n
    var ans: Int64 = 0
    // 排序后，数对 (i, j) (i < j) 的有趣值为 b_j^2 - b_i^2，
    // b_k 作为较大值出现 k-1 次、作为较小值出现 n-k 次，贡献系数为 2k-n-1。
    var i: Int64 = 0
    while (i < nn) {
        let v = a[i] % MOD
        let sq = (v * v) % MOD
        var coeff = (2 * (i + 1) - nn - 1) % MOD
        if (coeff < 0) {
            coeff += MOD
        }
        ans = (ans + coeff * sq) % MOD
        i += 1
    }
    println(ans)
}
```

</details>

要点：

- 系数 $2k-n-1$ 的取值范围约为 $[-10^6, 10^6]$，小于模数，取模后只需加一次模数即可转正。
- 每步乘法前都取模：`coeff * sq` 与 `ans + coeff * sq` 均不超过 $2 \times 10^{18}$，不会溢出 `Int64`。
