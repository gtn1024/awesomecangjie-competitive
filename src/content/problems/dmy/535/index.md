---
oj: dmy
pid: '535'
title: '[R83F] 构造全球化'
difficulty: 提高+/省选-
tags:
  - 数论
  - 中国剩余定理
  - 构造
timeLimit: 1s
memoryLimit: 512m
---

> 数据规模：$1 \le m \le 2 \times 10^5$，$1 \le |A| \le 2 \times 10^5$，$A$ 的首位为 $1$ 至 $9$，其余各位为 $0$ 至 $9$。

## 思路

**把要求写成两条同余式。** 设 $|A| = l_a$，名 $B$ 的长度为 $L$。姓在前得到的整数是 $A \cdot 10^L + B$，名在前得到的是 $B \cdot 10^{l_a} + A$，所以

$$B \equiv r_1 = -A \cdot 10^L \pmod m, \qquad B \cdot 10^{l_a} \equiv -A \pmod m.$$

**关键观察：第二条只由 $B \bmod m$ 决定。** 两条都是关于 $B$ 的模 $m$ 同余式，而第一条已经把 $B \bmod m$ 完全钉死为 $r_1$。因此长度 $L$ 可行，当且仅当「把 $r_1$ 代入第二条成立」并且区间 $[10^{L-1}, 10^L)$ 内确实存在模 $m$ 余 $r_1$ 的数。下面把「代入后成立」化成好算的判据。

**分解出 $g$ 再整体除。** 令 $g = \gcd(10^{l_a}, m)$。由于 $10^{l_a}$ 只有质因子 $2, 5$，

$$g = 2^{\min(l_a,\, v_2(m))} \cdot 5^{\min(l_a,\, v_5(m))},$$

把 $m$ 反复除以 $2$、$5$ 就能得到（$v_2(m) \le 17$，$v_5(m) \le 7$，故 $g \le m$）。

- 若 $g \nmid A$：因为 $g \mid 10^{l_a}$ 且 $g \mid m$，任何 $B$ 都使 $B \cdot 10^{l_a} + A \not\equiv 0 \pmod m$，直接输出 `NO`。
- 若 $g \mid A$：两边同除以 $g$，得 $B \cdot \frac{10^{l_a}}{g} \equiv -\frac{A}{g} \pmod{m_2}$，其中 $m_2 = m/g$。此时 $\frac{10^{l_a}}{g}$ 与 $m_2$ 互质：$v_2\left(\frac{10^{l_a}}{g}\right) = \max(0, l_a - v_2(m))$，而 $v_2(m_2) = \max(0, v_2(m) - l_a)$，两者不会同时为正，$5$ 的情形同理。求逆元即得

$$B \equiv r_2 = -\frac{A}{g} \cdot \left(\frac{10^{l_a}}{g}\right)^{-1} \pmod{m_2}.$$

$m_2 = 1$ 时第二条恒成立，取 $r_2 = 0$。求 $A/g \bmod m_2$ 不需要大整数除法：$g \mid A$ 且 $g \mid m$，于是 $(A \bmod m)/g = (A/g) \bmod m_2$。计算 $\frac{10^{l_a}}{g} \bmod m_2$ 时按 $2^{l_a - \min(l_a, v_2(m))} \cdot 5^{l_a - \min(l_a, v_5(m))}$ 快速幂即可，不必真除。

**合并两条同余，依据是 $m_2 \mid m$。** 若 $r_1 \bmod m_2 \ne r_2$，则 $B \equiv r_1 \pmod m$ 的任何解代回第二条都不成立，这个长度作废；反之若 $r_1 \bmod m_2 = r_2$，则所有 $B \equiv r_1 \pmod m$ 都自动满足第二条（它们都 $\equiv r_1 \pmod{m_2}$），可行解集恰好就是一条模 $m$ 的同余类。

**固定长度取最小解。** 类 $r_1 \bmod m$ 中不小于 $10^{L-1}$ 的最小数是 $B_0 = 10^{L-1} + \delta$，其中 $\delta = (r_1 - 10^{L-1}) \bmod m \in [0, m)$。$B_0$ 是 $L$ 位数当且仅当 $\delta < 9 \cdot 10^{L-1}$；因为 $\delta < m \le 2 \times 10^5$，只要 $L \ge 8$ 就必然成立，只有 $L \le 7$ 需要真的比较一次。$B_0$ 同时是长度为 $L$ 的最小可行解，所以按 $L$ 从小到大扫，第一次成功即为答案。

**长度上界。** $r_1 \bmod m_2 = (-A) \cdot 10^L \bmod m_2$ 只取决于 $10^L \bmod m_2$。当 $L$ 不小于 $\max(v_2(m_2), v_5(m_2))$ 时（这个阈值不会超过 $18$），$10^L$ 对 $m_2$ 的 $2$、$5$ 部分都是 $0$，剩下的取值由 $10^L$ 对 $o$ 取模决定，其中 $o$ 是 $m_2$ 去掉 $2, 5$ 因子后的部分。$10$ 与 $o$ 互质，$10^L \bmod o$ 从 $L = 0$ 起就是纯周期的，周期不超过 $\varphi(o) \le o \le m_2$。因此只要存在合法长度，就存在一个不超过 $m_2 + 18$ 的合法长度；扫到 $L = m_2 + 60$ 仍未成功即可输出 `NO`。

## 复杂度

读入 $A$ 需要 $O(|A|)$；检查长度需要 $O(m_2) \le O(m)$ 次常数运算；输出 $O(L) \le O(m)$。空间为 $O(|A| + L)$，即读入的数字串与输出串。

## 仓颉实现

答案长度可达 $2 \times 10^5$ 位。因为 $\delta < 10^7$，当长度较大时直接按「`1` + 若干个 `0` + $\delta$ 补足 $7$ 位」拼出答案，不会产生进位。

<details>
<summary>查看仓颉实现</summary>

```cangjie
import std.env.*

func readNum(s: String): Int64 {
    var x: Int64 = 0
    for (ch in s) {
        let c = Int64(ch)
        if (c > 32) {
            x = x * 10 + (c - 48)
        }
    }
    return x
}

func powMod(b: Int64, e: Int64, md: Int64): Int64 {
    var res: Int64 = 1 % md
    var base: Int64 = b % md
    var ex = e
    while (ex > 0) {
        if (ex % 2 == 1) {
            res = res * base % md
        }
        base = base * base % md
        ex /= 2
    }
    return res
}

func modInv(a: Int64, md: Int64): Int64 {
    var r0 = md
    var r1 = a % md
    var t0: Int64 = 0
    var t1: Int64 = 1
    while (r1 != 0) {
        let q = r0 / r1
        let nr = r0 - q * r1
        r0 = r1
        r1 = nr
        let nt = t0 - q * t1
        t0 = t1
        t1 = nt
    }
    var res = t0 % md
    if (res < 0) {
        res += md
    }
    return res
}

main() {
    let reader = getStdIn()
    let m = readNum(reader.readln().getOrThrow())
    let sa = reader.readln().getOrThrow()
    var am: Int64 = 0
    var la: Int64 = 0
    for (ch in sa) {
        let c = Int64(ch)
        if (c > 32) {
            am = (am * 10 + (c - 48)) % m
            la += 1
        }
    }
    var v2: Int64 = 0
    var t = m
    while (t % 2 == 0) {
        t /= 2
        v2 += 1
    }
    var v5: Int64 = 0
    t = m
    while (t % 5 == 0) {
        t /= 5
        v5 += 1
    }
    var e2 = la
    if (v2 < e2) {
        e2 = v2
    }
    var e5 = la
    if (v5 < e5) {
        e5 = v5
    }
    var g: Int64 = 1
    var i: Int64 = 0
    while (i < e2) {
        g *= 2
        i += 1
    }
    i = 0
    while (i < e5) {
        g *= 5
        i += 1
    }
    if (am % g != 0) {
        println("NO")
    } else {
        let m2 = m / g
        var r2: Int64 = 0
        if (m2 > 1) {
            let q = powMod(2, la - e2, m2) * powMod(5, la - e5, m2) % m2
            let inv = modInv(q, m2)
            let ag = am / g % m2
            r2 = (m2 - ag * inv % m2) % m2
        }
        var pm: Int64 = 1 % m
        var p: Int64 = 10 % m
        var t10: Int64 = 1
        var len: Int64 = 1
        let limit = m2 + 60
        var found = false
        var delta: Int64 = 0
        while (len <= limit && !found) {
            let r1 = (m - am * p % m) % m
            if (r1 % m2 == r2) {
                var d = (r1 - pm) % m
                if (d < 0) {
                    d += m
                }
                if (len > 7 || t10 + d < t10 * 10) {
                    found = true
                    delta = d
                }
            }
            if (!found) {
                pm = pm * 10 % m
                p = p * 10 % m
                if (t10 <= 100000000000000000) {
                    t10 *= 10
                }
                len += 1
            }
        }
        if (!found) {
            println("NO")
        } else if (len <= 18) {
            println(t10 + delta)
        } else {
            let sb = StringBuilder()
            sb.append("1")
            var z: Int64 = 0
            while (z < len - 8) {
                sb.append("0")
                z += 1
            }
            let ds = delta.toString()
            z = 0
            while (z < 7 - ds.size) {
                sb.append("0")
                z += 1
            }
            sb.append(ds)
            println(sb.toString())
        }
    }
}
```

</details>
