---
oj: dmy
pid: '338'
title: '[R54E]二元组和四元组'
difficulty: 提高
tags:
  - 数学
  - 二分
timeLimit: 1s
memoryLimit: 512m
---

> 数据规模：$1 \le n,m \le 2 \times 10^5$，$1 \le v \le 10^{18}$，$-10^9 \le a_1 < a_2 < \dots < a_n \le 10^9$，$-10^9 \le b_1 < b_2 < \dots < b_m \le 10^9$。

## 思路

固定整数 $x$，设恰好有 $p$ 个 $a_i$ 满足 $a_i \le x$。那么 $i$ 有 $p$ 种选择，$j$ 有 $n-p$ 种选择，所以满足 $a_i \le x < a_j$ 的二元组 $(i,j)$ 共有：

$$
p(n-p)
$$

当 $a_p \le x < a_{p+1}$ 时，$p$ 不变，这一段中共有 $a_{p+1}-a_p$ 个整数 $x$。同理，若 $b_q \le y < b_{q+1}$，满足 $b_k \le y < b_l$ 的二元组 $(k,l)$ 共有 $q(m-q)$ 个。因此该 $(x,y)$ 的权值是：

$$
p(n-p)q(m-q)
$$

枚举 $p=1,2,\dots,n-1$。记 $c=p(n-p)$，则需要找到所有满足：

$$
q(m-q)\ge \left\lceil\frac{v}{c}\right\rceil
$$

的 $q$。函数 $q(m-q)$ 在 $1\le q\le \lfloor m/2\rfloor$ 上单调递增，并且关于 $m/2$ 对称。若左半段中最小的合法位置为 $L$，那么所有合法位置恰好构成连续区间：

$$
[L,m-L]
$$

可以二分求出 $L$。这些位置对应的整数 $y$ 的数量为相邻差之和，即：

$$
\sum_{q=L}^{m-L}(b_{q+1}-b_q)=b_{m-L+1}-b_L
$$

将它乘上当前区间内整数 $x$ 的数量 $a_{p+1}-a_p$，再对所有 $p$ 求和即可。实现中用 $(v-1)/c+1$ 计算上取整，避免乘积 $p(n-p)q(m-q)$ 超出 `Int64`。

## 复杂度

时间复杂度为 $O(n\log m)$，空间复杂度为 $O(n+m)$。

## 仓颉实现

```cangjie
import std.convert.*
import std.env.*

func countValidY(b: Array<Int64>, m: Int64, need: Int64): Int64 {
    let half = m / 2
    if (half * (m - half) < need) {
        return 0
    }

    var left = Int64(1)
    var right = half
    while (left < right) {
        let mid = (left + right) >> 1
        if (mid * (m - mid) >= need) {
            right = mid
        } else {
            left = mid + 1
        }
    }
    return b[m - left] - b[left - 1]
}

main(): Int64 {
    let reader = getStdIn()
    let first = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
    let n = first[0]
    let m = first[1]
    let v = first[2]
    let a = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
    let b = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })

    var answer = Int64(0)
    var p = Int64(1)
    while (p < n) {
        let pairCount = p * (n - p)
        let need = (v - 1) / pairCount + 1
        let xCount = a[p] - a[p - 1]
        answer += xCount * countValidY(b, m, need)
        p += 1
    }

    println(answer)
    return 0
}
```
