---
oj: dmy
pid: '566'
title: '山丘建房'
difficulty: 提高
tags:
  - 线性 DP
timeLimit: 1s
memoryLimit: 256m
---

> 数据规模：$1 \le n \le 5000$，$1 \le a_i \le 10^5$。

## 思路

**先看清花费的结构。** 一个建房点 $i$ 合法的条件是 $a_i$ 严格大于每个相邻山丘。降低山丘只会让它的高度变小，所以

- 建房的山丘永远不需要降低：把它降低只会更难高于邻居，对别的约束也毫无帮助；
- 只需要降低建房点的邻居，且降低量由邻居自己的目标高度决定。

一座不建房的山丘 $j$ 可能同时挨着两个建房点 $i_1,i_2$，但它只被降低一次，最终高度必须小于两者中较小的那个，即降到 $\min(a_{i_1},a_{i_2})-1$，花费 $\max(0,a_j-\min(a_{i_1},a_{i_2})+1)$。因此总花费只与「哪些位置建房」有关，而与施工顺序无关；又因为建房点两两不能相邻，位置集合至多是 $\lceil n/2\rceil$ 个。

于是问题变成：对每个 $k$，在所有大小为 $k$ 的独立集（不相邻的位置集合）里，最小化

$$\sum_{j:\,j\notin S,\ N(j)\cap S\ne\varnothing}\Big(a_j-\min_{i\in N(j)\cap S}a_i+1\Big)^{+}.$$

**状态。** 从左往右决定每座山丘是否建房，记 $f(i,j,b)$ 为：只考虑前 $i$ 座山丘、其中恰好 $j$ 座建房、第 $i$ 座建（$b=1$）或不建（$b=0$）时的最小花费。

难点在于山丘 $i-1$ 的花费可能同时取决于 $i-2$ 和 $i$。直接在 $i$ 建房时把两侧邻居都按 $a_i$ 结算，会在 $i-2$ 也建房时把 $i-1$ 收费两次。解决办法是让右邻「先付、后补差」：

- 决定在 $i$ 建房时，先只按 $a_i$ 的需求把右邻 $i+1$ 降到位，付出

  $$\mathrm{payRight}(i)=\big(a_{i+1}-a_i+1\big)^{+},$$

  若 $i=n$（右边没有山丘）则为 $0$。此时 $a_{i+1}$ 的目标高度已经被定为 $\min(a_{i+1},a_i-1)$。

- 以后若发现 $i+2$ 也建房，只需补上 $a_{i+1}$ 再被压低的那部分差价，新增花费为

  $$\Big(\min(a_{i+1},a_i-1)-a_{i+2}+1\Big)^{+}.$$

而 $i$ 的左邻 $i-1$ 的花费，在决定 $i$ 时已经能确定（$i-2$ 是否建房已知）：

- $i-2$ 不建房：$i-1$ 只受 $i$ 约束，花费 $\big(a_{i-1}-a_i+1\big)^{+}$，记为 $\mathrm{left}_0$；
- $i-2$ 建房：$i-2$ 建房时已把 $a_{i-1}$ 降到 $\min(a_{i-1},a_{i-2}-1)$，现在只需再保证它小于 $a_i$，补差 $\big(\min(a_{i-1},a_{i-2}-1)-a_i+1\big)^{+}$，记为 $\mathrm{left}_1$。

**转移。** 建房点两两不相邻，所以 $i$ 建房时 $i-1$ 必不建房，只需看第 $i-2$ 行；$i$ 不建房时则从第 $i-1$ 行直接继承：

$$f(i,j,1)=\min\big(f(i-2,j-1,0)+\mathrm{left}_0,\ f(i-2,j-1,1)+\mathrm{left}_1\big)+\mathrm{payRight}(i),$$

$$f(i,j,0)=\min\big(f(i-1,j,0),\ f(i-1,j,1)\big).$$

**边界。** $i=1$ 没有左邻，$f(1,1,1)=\mathrm{payRight}(1)$。$i=2$ 时把第 $0$ 行看成「空前缀、$0$ 座、第 $0$ 座不建」（$f(0,0,0)=0$，其余为 $+\infty$），自然只会走到 $\mathrm{left}_0$ 分支，无需特判。$i=n$ 建房时右邻不存在，$\mathrm{payRight}(n)=0$。至于最后几座都不建房的情形（比如最后建房点是 $i<n$），已包含在 $f(n,j,0)=\min(f(n-1,j,0),f(n-1,j,1))$ 里，因为 $f(n-1,j,1)$ 中的 $\mathrm{payRight}(n-1)$ 恰好就是压低 $a_n$ 的花费。

**答案。** 恰好 $j$ 座建房的最优花费随 $j$ 单调不减（新加一座必然带来新的约束，而它原本不是任何建房点的邻居，本来不花一分钱），所以「至少 $k$ 座」就是恰好 $k$ 座的花费；代码里对 $j\ge k$ 取后缀最小值，两者一致。取 $\min\big(f(n,k,0),f(n,k,1)\big)$ 即可。

## 复杂度

状态数 $O(n^2)$（第二维只需到 $\lceil n/2\rceil$），转移 $O(1)$，时间 $O(n^2)$；每行只依赖前两行，空间 $O(n)$。花费上界 $n\cdot\max a_i=5\times10^8$，用 64 位整数足够。

## 仓颉实现

三行滚动（第 $i-2$ 行、第 $i-1$ 行、第 $i$ 行），每行两个状态数组；不可达状态用 $2^{60}$ 表示，累加不会溢出 64 位。

<details>
<summary>查看仓颉实现</summary>

```cangjie
import std.env.*
import std.convert.*

func larger(x: Int64, y: Int64): Int64 {
    if (x > y) {
        return x
    }
    return y
}

func smaller(x: Int64, y: Int64): Int64 {
    if (x < y) {
        return x
    }
    return y
}

main() {
    let reader = getStdIn()
    let n = Int64.parse(reader.readln().getOrThrow())
    let raw = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
    let a = Array<Int64>(n + 2, { _ => 0 })
    for (i in 1..=n) {
        a[i] = raw[i - 1]
    }
    let K = (n + 1) / 2
    let INF: Int64 = 1 << 60
    // 行 p 的两种状态：第 p 座建房 / 不建房，j 为已建房数量
    var d0 = Array<Int64>(K + 1, { _ => INF })
    var d1 = Array<Int64>(K + 1, { _ => INF })
    var e0 = Array<Int64>(K + 1, { _ => INF })
    var e1 = Array<Int64>(K + 1, { _ => INF })
    d0[0] = 0
    for (p in 1..=n) {
        let c0 = Array<Int64>(K + 1, { _ => INF })
        let c1 = Array<Int64>(K + 1, { _ => INF })
        for (j in 0..=K) {
            c0[j] = smaller(d0[j], d1[j])
        }
        // 建房 p 时右邻 p+1 的降低量（p 为末座时不计）
        let right = if (p + 1 <= n) { larger(0, a[p + 1] - a[p] + 1) } else { 0 }
        if (p == 1) {
            c1[1] = right
        } else {
            let left0 = larger(0, a[p - 1] - a[p] + 1)
            let left1 = if (p >= 3) { larger(0, smaller(a[p - 1], a[p - 2] - 1) - a[p] + 1) } else { 0 }
            for (j in 1..=K) {
                var best = e0[j - 1] + left0
                if (p >= 3) {
                    let w = e1[j - 1] + left1
                    if (w < best) {
                        best = w
                    }
                }
                c1[j] = best + right
            }
        }
        e0 = d0
        e1 = d1
        d0 = c0
        d1 = c1
    }
    let ans = Array<Int64>(K + 1, { _ => INF })
    var best: Int64 = INF
    var k = K
    while (k >= 1) {
        let v = smaller(d0[k], d1[k])
        if (v < best) {
            best = v
        }
        ans[k] = best
        k -= 1
    }
    let sb = StringBuilder()
    for (i in 1..=K) {
        if (i > 1) {
            sb.append(" ")
        }
        sb.append(ans[i])
    }
    println(sb.toString())
}
```

</details>
