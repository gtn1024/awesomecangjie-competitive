---
oj: dmy
pid: '358'
title: '[R57E] MyName'
difficulty: 普及+/提高
tags:
  - 数论
  - 枚举
timeLimit: 1s
memoryLimit: 512m
---

> 数据规模：$T \le 10^5$，$n \le 10^6$。

## 思路

$x^2 - y^2 = (x - y)(x + y) = z^3$。令 $u = x - y$，$v = x + y$，则 $uv = z^3$，且 $u \equiv v \pmod 2$（否则 $x = (u+v)/2$ 不是整数）。又因为 $y = (v - u)/2 \ge 1$，所以 $u < v$；$x = (u+v)/2 \le n$。

由 $z^3 = x^2 - y^2 < x^2 \le n^2$ 得 $z \le n^{2/3} \le 10^4$，因此只需枚举 $z \le 10^4$，再枚举 $z^3$ 的全部因子 $u$（因子成对出现，每个满足 $u < v$ 的 $u$ 唯一确定 $v = z^3 / u$），检查：

- $u < v$（即 $y \ge 1$，对应 $z^3 / u > u$）；
- $u + v$ 为偶数（$x, y$ 为整数）；
- $x = (u+v)/2 \le 10^6$。

每组合法因子对唯一对应一个三元组 $(x, y, z)$，且 $y < x$ 恒成立，故它首次被计入的上界是 $m = \max(x, z)$。在差分数组 $cnt[m]$ 上加 1，最后做一遍前缀和，$ans[n]$ 即为 $x, y, z \le n$ 的三元组数，每组询问 $O(1)$ 回答。

生成 $z^3$ 因子时先分解 $z$，把各质因子指数乘以 3，再逐质因子扩展因子列表（初始只有 1，对每个 $(p, 3a)$ 把 $p^1, p^2, \ldots, p^{3a}$ 依次乘到原列表上）。

复杂度：因子枚举总量 $\sum_{z \le 10^4} d(z^3) = \sum_{z \le 10^4} \prod_{p^a \parallel z}(3a+1) \approx 10^6$，加上 $O(10^6)$ 的差分与前缀和，空间 $O(10^6)$。

## 仓颉实现

<details>
<summary>查看仓颉实现</summary>

```cangjie
import std.convert.*
import std.env.*
import std.collection.*

main() {
    let MAXN = 1000000
    let MAXZ = 10000
    // 最小质因子筛，用于分解 z
    let spf = Array<Int64>(MAXZ + 1, { _ => 0 })
    for (i in 2..(MAXZ + 1)) { spf[i] = i }
    var p0: Int64 = 2
    while (p0 * p0 <= MAXZ) {
        if (spf[p0] == p0) {
            var j = p0 * p0
            while (j <= MAXZ) {
                if (spf[j] == j) { spf[j] = p0 }
                j = j + p0
            }
        }
        p0 = p0 + 1
    }
    // diff[m]：满足 max(x, y, z) = m 的三元组个数
    let diff = Array<Int64>(MAXN + 2, { _ => 0 })
    for (z in 1..(MAXZ + 1)) {
        let z3 = z * z * z
        // 分解 z，指数乘以 3 得到 z^3 的质因子指数
        var t = z
        let pf = ArrayList<Int64>()
        let pe = ArrayList<Int64>()
        while (t > 1) {
            let p = spf[t]
            var e: Int64 = 0
            while (t % p == 0) {
                t = t / p
                e = e + 1
            }
            pf.add(p)
            pe.add(3 * e)
        }
        // 生成 z^3 的全部因子
        let factors = ArrayList<Int64>()
        factors.add(1)
        for (k in 0..pf.size) {
            let p = pf[k]
            let e3 = pe[k]
            let sz0 = factors.size
            var pk: Int64 = 1
            for (e2 in 1..(e3 + 1)) {
                pk = pk * p
                for (j in 0..sz0) {
                    factors.add(factors[j] * pk)
                }
            }
        }
        // x^2 - y^2 = (x-y)(x+y) = uv = z^3，u < v 即 y >= 1
        for (u in factors) {
            if (z3 / u <= u) { continue }
            let v = z3 / u
            if ((u + v) % 2 != 0) { continue }
            let x = (u + v) / 2
            if (x > MAXN) { continue }
            let m = if (x > z) { x } else { z }
            diff[m] = diff[m] + 1
        }
    }
    // 前缀和：ans[n] = 满足 x, y, z <= n 的三元组个数
    let ans = Array<Int64>(MAXN + 1, { _ => 0 })
    var acc: Int64 = 0
    for (n in 1..(MAXN + 1)) {
        acc = acc + diff[n]
        ans[n] = acc
    }
    let reader = getStdIn()
    let T = Int64.parse(reader.readln().getOrThrow())
    for (i in 0..T) {
        let n = Int64.parse(reader.readln().getOrThrow())
        println(ans[n])
    }
}
```

</details>

要点：

- 判断 $u < v$ 用整除式 `z3 / u <= u` 跳过，避免 $u^2$ 超出 `Int64` 范围（$z^3$ 的因子本身可达 $10^{12}$）。
- 生成因子时，每个质因子的扩展要固定使用处理该质因子前的列表长度，否则已新增的因子会再次被乘上当前质因子，导致指数翻倍、数值膨胀。
