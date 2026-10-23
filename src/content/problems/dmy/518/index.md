---
oj: dmy
pid: '518'
title: '[R81G] 展板'
difficulty: 提高+/省选-
tags:
  - 字符串
  - 数论
  - 平衡树
timeLimit: 2s
memoryLimit: 512m
---

> 数据规模：$1 \le n \le 2\times 10^5$，$1 \le q \le 2\times 10^5$，$S$ 与每次修改给出的字符均为小写英文字母。

## 思路

**先看同构到底在比什么。** 用一一对应的规则把 $S$ 替换成 $T$，等价于：对任意两个位置 $i,j$，$S_i = S_j$ 当且仅当 $T_i = T_j$。也就是说，同构只关心「哪些位置字母相同」这一相等关系模式，与字母具体是哪一个无关。

**用一个数组刻画相等关系。** 对每个位置 $i$ 定义 $a_i$ 为沿固定方向从 $i$ 走到下一个与 $S_i$ 相同的字符所需步数；若该字母只出现一次，则 $a_i = n$（走满一圈回到自己）。

这个数组完全决定相等关系：从 $i$ 出发依次跳到 $i + a_i$、$i + a_i + a_{i+a_i}$、……，落到的正是与 $S_i$ 同字母的全部位置，其余位置都与之不同字母。所以 $a$ 相同的两个串同构，同构的两个串 $a$ 也相同。

**旋转在数组上的表现。** 从位置 $d$ 开始读得到的循环位移记作 $r_d(S)$。「找下一个同字母位置」这一步在整体平移后不变，于是

$$a_{r_d(S)}[i] = a_S[(i + d) \bmod n].$$

因此 $r_d(S)$ 与 $S$ 同构，当且仅当 $a$ 数组在平移 $d$ 之后与原数组完全相同。

**合法平移构成子群。** 记 $H$ 为所有使 $a$ 平移后保持不变的 $d$。平移 $d_1$、$d_2$ 都合法时平移 $d_1 + d_2$ 也合法，故 $H$ 是 $\mathbb{Z}_n$ 的子群（$n = |S|$）。轮换中第 $d$ 个与第 $d'$ 个同构当且仅当 $d' - d \in H$，同构类数就是 $H$ 的陪集数 $n / |H|$。若 $a$ 的最小正周期为 $g$，则 $H = \{0, g, 2g, \dots\}$、$|H| = n/g$，所以**答案正是 $a$ 的最小正周期 $g$**。

**用质因子求最小正周期。** $g \mid n$。设 $n = \prod p^{e_p}$，则 $g$ 中质因子 $p$ 的指数 $t_p$ 是满足「平移 $n/p^{t}$ 合法」的最大 $t$，因为平移 $n/p^{t}$ 合法等价于 $p^{t} \mid n/g$。于是对每个质因子 $p$ 依次检查 $d = n/p,\ n/p^2,\ \dots,\ n/p^{e_p}$：合法就把答案除以 $p$，遇到不合法的立刻停止这个质因子。

实现时对每个待检查的 $d$ 维护

$$bad_d = \#\{i : a_i \ne a_{(i+d)\bmod n}\},$$

$bad_d = 0$ 即为合法。$n \le 2\times 10^5$ 时所有质因子幂的总数 $K \le 17$，每次询问扫一遍这些 $bad$ 就得到答案。

**初始化。** 顺序扫描字符串，记每种字母上一次出现的位置 `prev` 与第一次出现的位置 `first`：扫到位置 $i$ 时令 $a_{prev} = i - prev$；扫完后令 $a_{prev} = first + n - prev$，该字母只出现一次时后一式恰好给出 $n$。

**一次修改只动常数个 $a_i$。** 把位置 $p$ 的字母从旧字母换成新字母，只影响旧字母与新字母各自的相邻距离：

- 旧字母集合删掉 $p$：只有 $p$ 的原前驱 `before` 的下一个同字母位置由 $p$ 变成 $p$ 的后继，需要更新 $a_{before}$；旧字母原本只出现一次时不必更新，因为 $a_p$ 随后会被覆盖。
- 新字母集合插入 $p$：设 $p$ 的后继为 `after`、前驱为 `before`，需要更新 $a_{before}$（其后继变成 $p$）和 $a_p$（其后继是 `after`）；新字母原本没出现过则 $a_p = n$。

所以每次修改至多改变 3 个位置。而把某个 $a_x$ 从 $old$ 改成 $value$ 时，$bad_d$ 只有 $i = x$ 和 $i = x - d$ 两项受影响：

$$bad_d \mathrel{+}= [value \ne a_{(x+d)\bmod n}] + [a_{(x-d)\bmod n} \ne value] - [old \ne a_{(x+d)\bmod n}] - [a_{(x-d)\bmod n} \ne old].$$

即使 $(x-d)\bmod n = (x+d)\bmod n$ 也成立，因为这两项对应 $bad_d$ 中两个不同的 $i$。

**找前驱后继。** 每种字母维护一棵以位置为下标的 Fenwick 树（点加、前缀和、第 $k$ 小均为 $O(\log n)$）。设该字母出现 $tot$ 次：

- 大于 $p$ 的最小位置：令 $c = \mathrm{prefix}(p+1)$，若 $c < tot$ 取第 $c+1$ 小，否则回绕取第 $1$ 小；
- 小于 $p$ 的最大位置：令 $c = \mathrm{prefix}(p)$，若 $c > 0$ 取第 $c$ 小，否则回绕取第 $tot$ 小。

不要用 `TreeSet` 的 `forward` / `backward` 找前驱后继：它们在目标键不在树上时，会先把全部键收集成一个数组再线性查找，单次退化成 $O(n)$，$2\times 10^5$ 次询问会超时。

## 复杂度

预处理 $O(n\log n + nK)$；单次修改 $O(K\log n)$，单次询问 $O(K)$，其中 $K$ 为 $n$ 的质因子幂总数（$n \le 2\times 10^5$ 时 $K \le 17$）。总时间 $O\bigl((n + q\log n)K\bigr)$，空间 $O(26n)$（26 棵 Fenwick 树，$n = 2\times 10^5$ 时约 21 MB）。

## 仓颉实现

<details>
<summary>查看仓颉实现</summary>

```cangjie
import std.convert.*
import std.env.*

func cycleDist(x: Int64, y: Int64, n: Int64): Int64 {
    var d = y - x
    if (d <= 0) {
        d = d + n
    }
    return d
}

class Bit {
    let n: Int64
    let t: Array<Int32>

    init(n0: Int64) {
        this.n = n0
        this.t = Array<Int32>(n0 + 1, { _ => 0 })
    }

    func add(i: Int64, d: Int32): Unit {
        var x = i
        while (x <= this.n) {
            this.t[x] = this.t[x] + d
            x = x + (x & -x)
        }
    }

    func prefix(i: Int64): Int64 {
        var s: Int64 = 0
        var x = i
        while (x > 0) {
            s = s + Int64(this.t[x])
            x = x - (x & -x)
        }
        return s
    }

    func kth(k: Int64): Int64 {
        var step: Int64 = 1
        while (step <= this.n) {
            step = step * 2
        }
        step = step / 2
        var pos: Int64 = 0
        var kk = k
        while (step > 0) {
            if (pos + step <= this.n) {
                let v = Int64(this.t[pos + step])
                if (v < kk) {
                    pos = pos + step
                    kk = kk - v
                }
            }
            step = step / 2
        }
        return pos + 1
    }
}

class Periods {
    let n: Int64
    let a: Array<Int64>
    let step: Array<Int64>
    let prime: Array<Int64>
    let bad: Array<Int64>
    let m: Int64

    init(n0: Int64, a0: Array<Int64>) {
        this.n = n0
        this.a = a0
        this.step = Array<Int64>(80, { _ => 0 })
        this.prime = Array<Int64>(80, { _ => 0 })
        this.bad = Array<Int64>(80, { _ => 0 })
        var cnt: Int64 = 0
        var rest = n0
        var p: Int64 = 2
        while (p <= rest / p) {
            if (rest % p == 0) {
                var power: Int64 = 1
                while (rest % p == 0) {
                    rest = rest / p
                    power = power * p
                    this.step[cnt] = n0 / power
                    this.prime[cnt] = p
                    cnt = cnt + 1
                }
            }
            p = p + 1
        }
        if (rest > 1) {
            this.step[cnt] = n0 / rest
            this.prime[cnt] = rest
            cnt = cnt + 1
        }
        this.m = cnt
        for (k in 0..cnt) {
            let d = this.step[k]
            var c: Int64 = 0
            for (i in 0..n0) {
                var j = i + d
                if (j >= n0) {
                    j = j - n0
                }
                if (this.a[i] != this.a[j]) {
                    c = c + 1
                }
            }
            this.bad[k] = c
        }
    }

    func change(x: Int64, value: Int64): Unit {
        let old = this.a[x]
        if (old != value) {
            for (k in 0..this.m) {
                let d = this.step[k]
                var left = x - d
                if (left < 0) {
                    left = left + this.n
                }
                var right = x + d
                if (right >= this.n) {
                    right = right - this.n
                }
                let ar = this.a[right]
                let al = this.a[left]
                var delta: Int64 = 0
                if (value != ar) {
                    delta = delta + 1
                }
                if (al != value) {
                    delta = delta + 1
                }
                if (old != ar) {
                    delta = delta - 1
                }
                if (al != old) {
                    delta = delta - 1
                }
                this.bad[k] = this.bad[k] + delta
            }
            this.a[x] = value
        }
    }

    func answer(): Int64 {
        var result = this.n
        for (k in 0..this.m) {
            if (this.bad[k] == 0) {
                result = result / this.prime[k]
            }
        }
        return result
    }
}

main() {
    let reader = getStdIn()
    let head = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
    let n = head[0]
    let q = head[1]
    let sbytes = reader.readln().getOrThrow().toArray()
    let letters = Array<Int64>(n, { _ => 0 })
    for (i in 0..n) {
        letters[i] = Int64(sbytes[i]) - 97
    }
    let a = Array<Int64>(n, { _ => n })
    let firstPos = Array<Int64>(26, { _ => -1 })
    let prevPos = Array<Int64>(26, { _ => -1 })
    for (i in 0..n) {
        let c = letters[i]
        if (firstPos[c] < 0) {
            firstPos[c] = i
        }
        if (prevPos[c] >= 0) {
            a[prevPos[c]] = i - prevPos[c]
        }
        prevPos[c] = i
    }
    for (c in 0..26) {
        if (firstPos[c] >= 0) {
            a[prevPos[c]] = firstPos[c] + n - prevPos[c]
        }
    }
    let bits = Array<Bit>(26, { _ => Bit(n) })
    let counts = Array<Int64>(26, { _ => 0 })
    for (i in 0..n) {
        let c = letters[i]
        bits[c].add(i + 1, 1)
        counts[c] = counts[c] + 1
    }
    let periods = Periods(n, a)
    for (_ in 0..q) {
        let parts = reader.readln().getOrThrow().split(" ", removeEmpty: true)
        let p = Int64.parse(parts[0]) - 1
        let cb = parts[1].toArray()
        let c = Int64(cb[0]) - 97
        let oc = letters[p]
        if (oc != c) {
            let oldBit = bits[oc]
            let oldCnt = counts[oc]
            if (oldCnt > 1) {
                let lt = oldBit.prefix(p)
                var bv: Int64
                if (lt > 0) {
                    bv = oldBit.kth(lt) - 1
                } else {
                    bv = oldBit.kth(oldCnt) - 1
                }
                let le = oldBit.prefix(p + 1)
                var av: Int64
                if (le < oldCnt) {
                    av = oldBit.kth(le + 1) - 1
                } else {
                    av = oldBit.kth(1) - 1
                }
                periods.change(bv, cycleDist(bv, av, n))
            }
            oldBit.add(p + 1, -1)
            counts[oc] = oldCnt - 1
            let newBit = bits[c]
            let newCnt = counts[c]
            if (newCnt == 0) {
                periods.change(p, n)
            } else {
                let le = newBit.prefix(p + 1)
                var av: Int64
                if (le < newCnt) {
                    av = newBit.kth(le + 1) - 1
                } else {
                    av = newBit.kth(1) - 1
                }
                let lt = newBit.prefix(av)
                var bv: Int64
                if (lt > 0) {
                    bv = newBit.kth(lt) - 1
                } else {
                    bv = newBit.kth(newCnt) - 1
                }
                periods.change(bv, cycleDist(bv, p, n))
                periods.change(p, cycleDist(p, av, n))
            }
            newBit.add(p + 1, 1)
            counts[c] = newCnt + 1
            letters[p] = c
        }
        println(periods.answer())
    }
}
```

</details>
