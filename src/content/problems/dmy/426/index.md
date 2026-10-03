---
oj: dmy
pid: '426'
title: '[R68F] 求和'
difficulty: 提高+/省选-
tags:
  - 组合数学
  - 容斥原理
timeLimit: 1s
memoryLimit: 512m
---

> 数据规模：$1 \le m \le 10$，$m \le n \le 3000$，$a_i, b_i < 998244353$。数值相同的元素按不同下标视为不同。

## 思路

设 $P_k = \sum_{i=1}^{n} a_i^k$ 为 $a$ 的幂和，$[m]$ 表示 $b$ 的下标集合。

**第一步：固定子序列位置与 $b'$。** 对固定的位置集合 $S = \{i_1 < \cdots < i_m\}$ 和固定的 $b'$，当 $a'$ 遍历 $n!$ 个下标排列时，$(a'_{i_1}, \ldots, a'_{i_m})$ 恰好以 $(n-m)!$ 的重数遍历所有互异下标的有序 $m$ 元组，故

$$\sum_{a'} \prod_{j=1}^{m} (a'_{i_j})^{b'_j} = (n-m)! \sum_{v_1, \ldots, v_m \text{ 互异}} \prod_{j=1}^{m} v_j^{b'_j}$$

对 $\binom{n}{m}$ 个 $S$ 求和得到因子 $\binom{n}{m}(n-m)! = \frac{n!}{m!}$，于是

$$\text{Ans} = \frac{n!}{m!} \sum_{b'} \sum_{v_1, \ldots, v_m \text{ 互异}} \prod_{j=1}^{m} v_j^{b'_j}$$

**第二步：对「互异」做集合划分容斥。** 把 $b'$ 写成 $b$ 下标双射 $\sigma$（即 $b'_j = b_{\sigma(j)}$，共 $m!$ 种），用划分格上的 Möbius 容斥拆掉「互异」约束：

$$\sum_{v_1, \ldots, v_m \text{ 互异}} \prod_{j=1}^{m} v_j^{b_{\sigma(j)}} = \sum_{\pi \vdash [m]} \mu(\pi) \prod_{B \in \pi} P_{\sum_{j \in B} b_{\sigma(j)}}, \qquad \mu(\pi) = \prod_{B \in \pi} (-1)^{|B|-1} (|B|-1)!$$

直观地看：划分 $\pi$ 把「同一块内的下标必须相等」计入，块 $B$ 共用一个值 $v$，贡献 $\sum_v v^{\sum_{j \in B} b_{\sigma(j)}} = P_{\sum_{j \in B} b_{\sigma(j)}}$。

**第三步：按块大小形状合并。** 对划分 $\pi$，记其块大小形状为 $\beta = (\beta_1, \ldots, \beta_k)$（即 $m$ 的一个整数拆分），则 $\mu(\pi)$ 只依赖形状。固定 $\pi$ 后，$\sigma$ 遍历 $m!$ 个双射，按每个块实际分到的 $b$ 下标集合分组：

$$\sum_{\sigma} \prod_{B \in \pi} P_{\sum_{j \in B} b_{\sigma(j)}} = \left(\prod_{i=1}^{k} \beta_i!\right) \cdot T(\beta)$$

其中 $T(\beta)$ 为对所有有序划分 $(S_1, \ldots, S_k)$（$S_i$ 两两不交、$\bigcup S_i = [m]$、$|S_i| = \beta_i$）求和 $\prod_{i=1}^{k} P_{\sum_{j \in S_i} b_j}$。形状为 $\beta$ 的集合划分个数为 $\frac{m!}{\prod_i \beta_i! \cdot \prod_s c_s!}$，其中 $c_s$ 是形状中等于 $s$ 的块数。把以上各项与 $\frac{n!}{m!}$ 相乘，$\prod_i \beta_i!$ 全部相消，得到最终公式：

$$\text{Ans} = n! \sum_{\beta \vdash m} \frac{\prod_{i} (-1)^{\beta_i - 1}(\beta_i - 1)!}{\prod_s c_s!} \cdot T(\beta)$$

**第四步：计算。** $m \le 10$，$m$ 的整数拆分只有 $p(10) = 42$ 种。幂和 $P[S] = \sum_i a_i^{\sum_{j \in S} b_j}$ 对每个 $a_i$ 做一次子集 DP 求出：$p[\varnothing] = 1$，$p[S] = p[S \setminus \{j\}] \cdot a_i^{b_j}$（$j$ 取 $S$ 的最低二进制位），累加进 $P[S]$。$T(\beta)$ 用状压 DP：设 $f[U]$ 为前若干块恰好占用下标集合 $U$ 的贡献和，初始 $f[\varnothing] = 1$；对大小为 $t$ 的块做转移

$$g[U \cup S] \mathrel{+}= f[U] \cdot P[S] \qquad (|S| = t,\ S \cap U = \varnothing)$$

最后取 $T = f[[m]]$。分母 $\prod_s c_s!$ 用费马小定理求逆元，答案最后乘 $n!$。

## 复杂度

时间 $O(n 2^m + p(m) \cdot m 3^m)$（$p(m)$ 为整数拆分数），空间 $O(2^m)$。$m \le 10$ 时 $2^m = 1024$，主体 $O(n 2^m) \approx 3 \times 10^6$ 次模乘。

## 仓颉实现

<details>
<summary>查看仓颉实现</summary>

```cangjie
import std.collection.*
import std.convert.*
import std.env.*

const MOD: Int64 = 998244353

func powmod(base: Int64, e: Int64): Int64 {
    var r: Int64 = 1
    var b = base % MOD
    var ex = e
    while (ex > 0) {
        if (ex % 2 == 1) {
            r = r * b % MOD
        }
        b = b * b % MOD
        ex = ex / 2
    }
    return r
}

// 枚举 m 的整数拆分（非增序列），存到 shapes
func genShapes(rem: Int64, mn: Int64, cur: ArrayList<Int64>, shapes: ArrayList<Array<Int64>>): Unit {
    if (rem == 0) {
        let arr = Array<Int64>(cur.size, { _ => 0 })
        for (k in 0..cur.size) {
            arr[k] = cur[k]
        }
        shapes.add(arr)
        return
    }
    var x = mn
    if (x > rem) {
        x = rem
    }
    while (x >= 1) {
        cur.add(x)
        genShapes(rem - x, x, cur, shapes)
        cur.remove(at: cur.size - 1)
        x -= 1
    }
}

main() {
    let reader = getStdIn()
    let nm = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
    let n = nm[0]
    let m = nm[1]
    let a = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
    let b = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
    let mm = m
    let sz = 1 << mm

    // fact[k] = k!
    let fact = Array<Int64>(mm + 1, { _ => 1 })
    for (k in 1..mm + 1) {
        fact[k] = fact[k - 1] * k % MOD
    }

    // lsbIdx[mask]：mask 最低位 1 的下标（0 起）
    let lsbIdx = Array<Int64>(sz, { _ => 0 })
    for (mask in 1..sz) {
        if (mask % 2 == 1) {
            lsbIdx[mask] = 0
        } else {
            lsbIdx[mask] = lsbIdx[mask / 2] + 1
        }
    }

    // pop[mask]：1 的个数；masksByPop[t]：含 t 个 1 的所有 mask
    let pop = Array<Int64>(sz, { _ => 0 })
    let masksByPop = Array<ArrayList<Int64>>(mm + 1, { _ => ArrayList<Int64>() })
    for (mask in 0..sz) {
        if (mask > 0) {
            pop[mask] = pop[mask / 2] + mask % 2
        }
        masksByPop[pop[mask]].add(mask)
    }

    // P[mask] = sum_i a_i^sum(b 中 mask 对应下标的 b 值)，模 MOD
    let P = Array<Int64>(sz, { _ => 0 })
    P[0] = n % MOD
    let row = Array<Int64>(sz, { _ => 0 })
    let w = Array<Int64>(mm, { _ => 0 })
    for (i in 0..n) {
        row[0] = 1
        for (j in 0..mm) {
            w[j] = powmod(a[i], b[j])
        }
        for (mask in 1..sz) {
            let j = lsbIdx[mask]
            row[mask] = row[mask ^ (1 << j)] * w[j] % MOD
        }
        for (mask in 1..sz) {
            P[mask] = (P[mask] + row[mask]) % MOD
        }
    }

    // 枚举 m 的整数拆分（形状），对每个形状算 T 并累加
    let shapes = ArrayList<Array<Int64>>()
    genShapes(mm, mm, ArrayList<Int64>(), shapes)
    let fullMask = sz - 1
    var ans: Int64 = 0
    for (shape in shapes) {
        // 系数：prod_i (-1)^{t_i-1} (t_i-1)! / prod_s (c_s)!
        var num: Int64 = 1
        let cnt = Array<Int64>(mm + 1, { _ => 0 })
        for (t in shape) {
            cnt[t] += 1
            var sgn: Int64 = 1
            if (t % 2 == 0) {
                sgn = MOD - 1
            }
            num = num * sgn % MOD * fact[t - 1] % MOD
        }
        var den: Int64 = 1
        for (s in 1..mm + 1) {
            if (cnt[s] > 0) {
                den = den * fact[cnt[s]] % MOD
            }
        }
        let coeff = num * powmod(den, MOD - 2) % MOD

        // T：按拆分顺序把 b 的下标集合划分到各块（块有标号），DP 枚举
        var f = Array<Int64>(sz, { _ => 0 })
        f[0] = 1
        var used: Int64 = 0
        for (t in shape) {
            let g = Array<Int64>(sz, { _ => 0 })
            for (U in masksByPop[used]) {
                if (f[U] == 0) {
                    continue
                }
                for (S in masksByPop[t]) {
                    if ((S & U) != 0) {
                        continue
                    }
                    g[U | S] = (g[U | S] + f[U] * P[S]) % MOD
                }
            }
            f = g
            used += t
        }
        ans = (ans + coeff * f[fullMask]) % MOD
    }

    // 乘 n!
    for (k in 2..n + 1) {
        ans = ans * k % MOD
    }
    println(ans)
}
```

</details>
